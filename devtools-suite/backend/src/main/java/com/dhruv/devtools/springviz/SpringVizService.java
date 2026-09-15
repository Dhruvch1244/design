package com.dhruv.devtools.springviz;

import com.dhruv.devtools.springviz.dto.SpringVizResult;
import com.dhruv.devtools.springviz.dto.SpringVizResult.Edge;
import com.dhruv.devtools.springviz.dto.SpringVizResult.Endpoint;
import com.dhruv.devtools.springviz.dto.SpringVizResult.Node;
import com.github.javaparser.StaticJavaParser;
import com.github.javaparser.ast.CompilationUnit;
import com.github.javaparser.ast.NodeList;
import com.github.javaparser.ast.body.*;
import com.github.javaparser.ast.expr.*;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.*;
import java.util.stream.Stream;

/**
 * Static-analysis repo visualizer: walks a local Spring Boot project's .java sources with
 * JavaParser (AST only, no compilation/classpath needed) to find @RestController/@Service/
 * @Repository/@Component classes, the HTTP endpoints controllers expose, and "depends on"
 * edges inferred from field/constructor injection where the injected type is itself a
 * discovered bean. Also does a light line-scan of application.properties/yml for
 * server.port and server.servlet.context-path so endpoint paths can be shown as real URLs.
 *
 * This is deliberately a heuristic, not a full Spring context resolution — no classpath
 * scanning, no interface-to-impl resolution, no conditional beans. Good enough to see the
 * shape of a codebase at a glance, same spirit as SqlGuard's "confident heuristic" approach.
 */
@Service
public class SpringVizService {

    private static final Set<String> STEREOTYPES = Set.of(
            "RestController", "Controller", "Service", "Repository", "Component", "Configuration");

    private static final Map<String, String> MAPPING_TO_METHOD = Map.of(
            "GetMapping", "GET",
            "PostMapping", "POST",
            "PutMapping", "PUT",
            "DeleteMapping", "DELETE",
            "PatchMapping", "PATCH");

    public SpringVizResult.Response analyze(String rootPath) {
        Path root = Path.of(rootPath);
        if (!Files.isDirectory(root)) {
            throw new IllegalArgumentException("'" + rootPath + "' is not a directory.");
        }

        List<Path> javaFiles;
        try (Stream<Path> walk = Files.walk(root)) {
            javaFiles = walk
                    .filter(p -> p.toString().endsWith(".java"))
                    .filter(p -> !p.toString().contains(targetDirMarker()))
                    .toList();
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        }
        if (javaFiles.isEmpty()) {
            throw new IllegalArgumentException("No .java files found under '" + rootPath + "'.");
        }

        // Pass 1: find every stereotyped class, keyed by simple class name.
        Map<String, Node> nodesByName = new LinkedHashMap<>();
        Map<String, ClassOrInterfaceDeclaration> declByName = new HashMap<>();
        int scanned = 0;

        for (Path file : javaFiles) {
            CompilationUnit cu;
            try {
                cu = StaticJavaParser.parse(file);
                scanned++;
            } catch (Exception e) {
                continue; // unparsable file (syntax error, unsupported language level) — skip, don't fail the whole scan
            }
            String pkg = cu.getPackageDeclaration().map(pd -> pd.getNameAsString()).orElse("");

            for (ClassOrInterfaceDeclaration decl : cu.findAll(ClassOrInterfaceDeclaration.class)) {
                if (decl.isInterface()) continue;
                String kind = stereotypeOf(decl);
                if (kind == null) continue;

                String name = decl.getNameAsString();
                declByName.put(name, decl);
                nodesByName.put(name, new Node(name, name, pkg, kind, 0));
            }
        }

        // Pass 2: endpoints (controllers only) + dependency edges (any bean -> any other known bean).
        List<Endpoint> endpoints = new ArrayList<>();
        List<Edge> edges = new ArrayList<>();
        Map<String, Integer> endpointCounts = new HashMap<>();

        for (var entry : declByName.entrySet()) {
            String name = entry.getKey();
            ClassOrInterfaceDeclaration decl = entry.getValue();
            String kind = nodesByName.get(name).kind();

            if (kind.equals("RestController") || kind.equals("Controller")) {
                String basePath = classRequestMappingPath(decl);
                for (MethodDeclaration m : decl.getMethods()) {
                    for (AnnotationExpr ann : m.getAnnotations()) {
                        String annName = ann.getNameAsString();
                        String httpMethod = MAPPING_TO_METHOD.get(annName);
                        if (httpMethod == null && !annName.equals("RequestMapping")) continue;
                        if (httpMethod == null) httpMethod = "GET"; // bare @RequestMapping default, heuristic

                        String methodPath = firstStringValue(ann, "value", "path").orElse("");
                        String fullPath = joinPaths(basePath, methodPath);
                        endpoints.add(new Endpoint(httpMethod, fullPath, name, m.getNameAsString()));
                        endpointCounts.merge(name, 1, Integer::sum);
                    }
                }
            }

            for (String depType : injectedTypeNames(decl)) {
                if (declByName.containsKey(depType) && !depType.equals(name)) {
                    edges.add(new Edge(name, depType));
                }
            }
        }

        List<Node> nodes = nodesByName.values().stream()
                .map(n -> new Node(n.id(), n.simpleName(), n.packageName(), n.kind(), endpointCounts.getOrDefault(n.id(), 0)))
                .sorted(Comparator.comparing(Node::kind).thenComparing(Node::simpleName))
                .toList();

        List<Edge> dedupedEdges = edges.stream().distinct().toList();

        AppConfig config = readAppConfig(root);

        return new SpringVizResult.Response(nodes, dedupedEdges, endpoints, config.contextPath, config.port, scanned);
    }

    private String stereotypeOf(ClassOrInterfaceDeclaration decl) {
        for (AnnotationExpr ann : decl.getAnnotations()) {
            String n = ann.getNameAsString();
            if (STEREOTYPES.contains(n)) return n;
        }
        return null;
    }

    private String classRequestMappingPath(ClassOrInterfaceDeclaration decl) {
        for (AnnotationExpr ann : decl.getAnnotations()) {
            if (ann.getNameAsString().equals("RequestMapping")) {
                return firstStringValue(ann, "value", "path").orElse("");
            }
        }
        return "";
    }

    private Optional<String> firstStringValue(AnnotationExpr ann, String... memberNames) {
        if (ann instanceof SingleMemberAnnotationExpr sm) {
            return firstStringFromExpr(sm.getMemberValue());
        }
        if (ann instanceof NormalAnnotationExpr normal) {
            for (MemberValuePair pair : normal.getPairs()) {
                for (String wanted : memberNames) {
                    if (pair.getNameAsString().equals(wanted)) {
                        return firstStringFromExpr(pair.getValue());
                    }
                }
            }
        }
        return Optional.empty();
    }

    private Optional<String> firstStringFromExpr(Expression expr) {
        if (expr instanceof StringLiteralExpr s) return Optional.of(s.asString());
        if (expr instanceof ArrayInitializerExpr arr && !arr.getValues().isEmpty()) {
            Expression first = arr.getValues().get(0);
            if (first instanceof StringLiteralExpr s) return Optional.of(s.asString());
        }
        return Optional.empty();
    }

    private String joinPaths(String base, String method) {
        String b = base == null ? "" : base.trim();
        String m = method == null ? "" : method.trim();
        String joined = m.isEmpty() ? b : (b.endsWith("/") ? b.substring(0, b.length() - 1) : b) + "/" + (m.startsWith("/") ? m.substring(1) : m);
        joined = joined.replaceAll("/+", "/");
        if (joined.length() > 1 && joined.endsWith("/")) joined = joined.substring(0, joined.length() - 1);
        if (joined.isEmpty()) return "/";
        return joined.startsWith("/") ? joined : "/" + joined;
    }

    /** Field injection (@Autowired or plain field) plus constructor-parameter injection. */
    private Set<String> injectedTypeNames(ClassOrInterfaceDeclaration decl) {
        Set<String> types = new LinkedHashSet<>();
        for (FieldDeclaration f : decl.getFields()) {
            if (f.isStatic()) continue;
            for (VariableDeclarator v : f.getVariables()) {
                simpleTypeName(v.getType()).ifPresent(types::add);
            }
        }
        for (ConstructorDeclaration c : decl.getConstructors()) {
            for (Parameter p : c.getParameters()) {
                simpleTypeName(p.getType()).ifPresent(types::add);
            }
        }
        return types;
    }

    private Optional<String> simpleTypeName(com.github.javaparser.ast.type.Type type) {
        if (type.isClassOrInterfaceType()) {
            return Optional.of(type.asClassOrInterfaceType().getNameAsString());
        }
        return Optional.empty();
    }

    private record AppConfig(String contextPath, Integer port) {}

    private AppConfig readAppConfig(Path root) {
        List<Path> candidates;
        try (Stream<Path> walk = Files.walk(root)) {
            candidates = walk
                    .filter(p -> {
                        String n = p.getFileName().toString();
                        return n.equals("application.properties") || n.equals("application.yml") || n.equals("application.yaml");
                    })
                    .toList();
        } catch (IOException e) {
            return new AppConfig(null, null);
        }

        for (Path file : candidates) {
            List<String> lines;
            try {
                lines = Files.readAllLines(file);
            } catch (IOException e) {
                continue;
            }
            AppConfig found = file.toString().endsWith(".properties") ? parseProperties(lines) : parseYaml(lines);
            if (found.contextPath() != null || found.port() != null) return found;
        }
        return new AppConfig(null, null);
    }

    private AppConfig parseProperties(List<String> lines) {
        String contextPath = null;
        Integer port = null;
        for (String line : lines) {
            String trimmed = line.trim();
            if (trimmed.startsWith("server.servlet.context-path")) {
                contextPath = valueAfterEquals(trimmed);
            } else if (trimmed.startsWith("server.port")) {
                port = parseIntSafe(valueAfterEquals(trimmed));
            }
        }
        return new AppConfig(contextPath, port);
    }

    private String valueAfterEquals(String line) {
        int i = line.indexOf('=');
        if (i < 0) i = line.indexOf(':');
        return i < 0 ? null : line.substring(i + 1).trim();
    }

    /** Minimal indentation-tracking YAML walk — only cares about server: / port: / servlet: context-path:. */
    private AppConfig parseYaml(List<String> lines) {
        String contextPath = null;
        Integer port = null;
        Deque<String> stack = new ArrayDeque<>();
        int[] stackIndent = new int[32];
        int depth = 0;

        for (String raw : lines) {
            if (raw.isBlank() || raw.trim().startsWith("#")) continue;
            int indent = raw.length() - raw.stripLeading().length();
            String trimmed = raw.trim();
            int colon = trimmed.indexOf(':');
            if (colon < 0) continue;
            String key = trimmed.substring(0, colon).trim();
            String value = trimmed.substring(colon + 1).trim();

            while (depth > 0 && indent <= stackIndent[depth - 1]) {
                stack.pop();
                depth--;
            }

            List<String> path = new ArrayList<>(stack);
            Collections.reverse(path);
            path.add(key);

            if (path.equals(List.of("server", "port"))) {
                port = parseIntSafe(value);
            } else if (path.equals(List.of("server", "servlet", "context-path"))) {
                contextPath = stripQuotes(value);
            }

            if (value.isEmpty()) {
                stack.push(key);
                stackIndent[depth] = indent;
                depth++;
            }
        }
        return new AppConfig(contextPath, port);
    }

    private String stripQuotes(String s) {
        if (s == null) return null;
        if (s.length() >= 2 && (s.startsWith("\"") && s.endsWith("\"") || s.startsWith("'") && s.endsWith("'"))) {
            return s.substring(1, s.length() - 1);
        }
        return s;
    }

    private Integer parseIntSafe(String s) {
        if (s == null) return null;
        try {
            return Integer.parseInt(s.replaceAll("[^0-9]", ""));
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private String targetDirMarker() {
        return java.io.File.separator + "target" + java.io.File.separator;
    }
}
