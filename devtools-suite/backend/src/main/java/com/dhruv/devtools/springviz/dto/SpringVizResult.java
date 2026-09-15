package com.dhruv.devtools.springviz.dto;

import java.util.List;

public class SpringVizResult {

    public record Node(String id, String simpleName, String packageName, String kind, int endpointCount) {}

    public record Edge(String from, String to) {}

    public record Endpoint(String httpMethod, String path, String controllerClass, String methodName) {}

    public record Response(
            List<Node> nodes,
            List<Edge> edges,
            List<Endpoint> endpoints,
            String contextPath,
            Integer port,
            int javaFilesScanned
    ) {}
}
