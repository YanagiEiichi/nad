package cn.lalaframework.nad.models;

import cn.lalaframework.nad.utils.Reflection;
import cn.lalaframework.nad.utils.TypeCollector;
import org.springframework.lang.NonNull;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.mvc.condition.NameValueExpression;
import org.springframework.web.servlet.mvc.condition.PatternsRequestCondition;
import org.springframework.web.servlet.mvc.method.RequestMappingInfo;
import org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerMapping;
import org.springframework.web.util.pattern.PathPattern;

import java.lang.reflect.Type;
import java.util.*;
import java.util.stream.Collectors;

public class NadRoute {
    @NonNull
    private final String name;
    @NonNull
    private final String bean;
    @NonNull
    private final Set<RequestMethod> methods;
    @NonNull
    private final List<String> patterns;
    @NonNull
    private final Set<NameValueExpression<String>> headers;
    @NonNull
    private final List<NadParameter> parameters;
    @NonNull
    private final List<NadAnnotation> annotations;
    @NonNull
    private final String returnType;

    private NadRoute(@NonNull RequestMappingInfo info, @NonNull HandlerMethod method) {
        name = method.getMethod().getName();
        bean = method.getBeanType().getTypeName();

        methods = info.getMethodsCondition().getMethods();
        patterns = getActivePatterns(info);
        headers = info.getHeadersCondition().getExpressions();

        parameters = Arrays.stream(method.getMethodParameters()).map(NadParameter::new).collect(Collectors.toList());
        annotations = NadAnnotation.fromAnnotatedElement(method.getMethod());
        Type genericReturnType = method.getMethod().getGenericReturnType();
        TypeCollector.collect(genericReturnType);
        returnType = genericReturnType.getTypeName();
    }

    @NonNull
    public static NadRoute create(RequestMappingInfo requestMappingInfo, HandlerMethod handlerMethod) {
        return new NadRoute(requestMappingInfo, handlerMethod);
    }

    @NonNull
    public static List<NadRoute> fromMapping(RequestMappingHandlerMapping requestMappingHandlerMapping) {
        return requestMappingHandlerMapping.getHandlerMethods().entrySet().stream()
                .map(e -> NadRoute.create(e.getKey(), e.getValue()))
                .collect(Collectors.toList());
    }


    private List<String> getActivePatterns(RequestMappingInfo info) {
        // Compatible with future versions of the SpringFramework.
        Object pc1 = Reflection.invokeMethod(info, "getPathPatternsCondition");
        if (pc1 != null) {
            Object set = Reflection.invokeMethod(pc1, "getPatterns");
            if (set instanceof Set) {
                return ((Set<?>) set).stream().map(i -> {
                    if (i instanceof PathPattern) return ((PathPattern) i).getPatternString();
                    return null;
                }).filter(Objects::nonNull).collect(Collectors.toList());
            }
        }
        PatternsRequestCondition pc2 = info.getPatternsCondition();
        // It may be null in future version of the SpringFramework.
        // noinspection ConstantConditions
        if (pc2 != null) { // nosonar
            return new ArrayList<>(pc2.getPatterns());
        }
        return new ArrayList<>();
    }

    @NonNull
    public Set<RequestMethod> getMethods() {
        return methods;
    }

    @NonNull
    public List<String> getPatterns() {
        return patterns;
    }

    @NonNull
    public Set<NameValueExpression<String>> getHeaders() {
        return headers;
    }

    @NonNull
    public String getName() {
        return name;
    }

    @NonNull
    public String getBean() {
        return bean;
    }

    @NonNull
    public List<NadParameter> getParameters() {
        return parameters;
    }

    @NonNull
    public List<NadAnnotation> getAnnotations() {
        return annotations;
    }

    @NonNull
    public String getReturnType() {
        return returnType;
    }
}
