package com.dhruv.devtools.service;

import com.dhruv.devtools.dto.XmlFormatResult;
import org.springframework.stereotype.Service;
import org.w3c.dom.Document;
import org.xml.sax.InputSource;

import javax.xml.XMLConstants;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.transform.OutputKeys;
import javax.xml.transform.Transformer;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.dom.DOMSource;
import javax.xml.transform.stream.StreamResult;
import java.io.StringReader;
import java.io.StringWriter;

@Service
public class XmlService {

    public XmlFormatResult format(String input) {
        try {
            DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
            factory.setFeature("http://apache.org/xml/features/disallow-doctype-decl", true);
            factory.setFeature("http://xml.org/sax/features/external-general-entities", false);
            factory.setFeature("http://xml.org/sax/features/external-parameter-entities", false);
            factory.setXIncludeAware(false);
            factory.setExpandEntityReferences(false);
            factory.setAttribute(XMLConstants.ACCESS_EXTERNAL_DTD, "");
            factory.setAttribute(XMLConstants.ACCESS_EXTERNAL_SCHEMA, "");

            DocumentBuilder builder = factory.newDocumentBuilder();
            Document doc = builder.parse(new InputSource(new StringReader(input)));
            doc.normalize();

            TransformerFactory tf = TransformerFactory.newInstance();
            tf.setAttribute(XMLConstants.ACCESS_EXTERNAL_DTD, "");
            tf.setAttribute(XMLConstants.ACCESS_EXTERNAL_STYLESHEET, "");
            Transformer transformer = tf.newTransformer();
            transformer.setOutputProperty(OutputKeys.INDENT, "yes");
            transformer.setOutputProperty(OutputKeys.OMIT_XML_DECLARATION, "no");
            transformer.setOutputProperty("{http://xml.apache.org/xslt}indent-amount", "2");

            StringWriter writer = new StringWriter();
            transformer.transform(new DOMSource(doc), new StreamResult(writer));
            return new XmlFormatResult(true, writer.toString(), null, null);
        } catch (Exception e) {
            String fallback = lineBreakInvalidXml(input);
            return new XmlFormatResult(false, null, e.getMessage(), fallback);
        }
    }

    /** Breaks unparsable XML/SOAP-ish text onto separate lines at tag boundaries. */
    private String lineBreakInvalidXml(String input) {
        String collapsed = input.replaceAll(">\\s*<", ">\n<").trim();
        StringBuilder out = new StringBuilder();
        int indent = 0;
        for (String rawLine : collapsed.split("\n")) {
            String line = rawLine.trim();
            if (line.isEmpty()) continue;
            boolean isClosing = line.startsWith("</");
            boolean isSelfClosing = line.endsWith("/>");
            boolean isOpening = line.startsWith("<") && !isClosing && !isSelfClosing && !line.startsWith("<?");

            if (isClosing) indent = Math.max(0, indent - 1);
            out.append("  ".repeat(indent)).append(line).append('\n');
            if (isOpening) indent++;
        }
        return out.toString();
    }
}
