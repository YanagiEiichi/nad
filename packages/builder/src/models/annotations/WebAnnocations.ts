import { Annotations } from '.';
import { u2b } from 'u2x';
import { AnnotationBase } from './AnnotationBase';
import { u2s } from 'u2x';
import { RequestMapping } from './RequestMapping';

export abstract class ValueAliasName extends AnnotationBase<string> {
  get value(): string {
    return u2s(this.raw.name || this.raw.value);
  }
}

/**
 * @see https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/web/bind/annotation/RequestParam.html
 */
export class RequestParam extends ValueAliasName {
  public static readonly iface = 'org.springframework.web.bind.annotation.RequestParam';
  public static readonly DEFAULT_VALUE = '\n\t\t\n\t\t\n\uE000\uE001\uE002\n\t\t\t\t\n';
  get defaultValue() {
    const value = u2s(this.raw.defaultValue);
    if (value === RequestParam.DEFAULT_VALUE) return undefined;
    return value;
  }
  get required() {
    return u2b(this.raw.required) ?? true;
  }
}

/**
 * @see https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/web/bind/annotation/PathVariable.html
 */
export class PathVariable extends ValueAliasName {
  public static iface = 'org.springframework.web.bind.annotation.PathVariable';
  get required() {
    return u2b(this.raw.required) ?? true;
  }
}

/**
 * @see https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/web/bind/annotation/RequestBody.html
 */
export class RequestBody extends ValueAliasName {
  public static iface = 'org.springframework.web.bind.annotation.RequestBody';
  get required() {
    return u2b(this.raw.required) ?? true;
  }
}

/**
 * @see https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/web/bind/annotation/ModelAttribute.html
 */
export class ModelAttribute extends ValueAliasName {
  public static iface = 'org.springframework.web.bind.annotation.ModelAttribute';
}

/**
 * @see https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/web/bind/annotation/CookieValue.html
 */
export class CookieValue extends ValueAliasName {
  public static iface = 'org.springframework.web.bind.annotation.CookieValue';
}

/**
 * @see https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/web/bind/annotation/RequestHeader.html
 */
export class RequestHeader extends ValueAliasName {
  public static iface = 'org.springframework.web.bind.annotation.RequestHeader';
  get required() {
    return u2b(this.raw.required) ?? true;
  }
}

export class WebAnnotations {
  private annotations;

  constructor(annotations: Annotations) {
    this.annotations = annotations;
  }

  getRequestBody() {
    return RequestBody.create(this.annotations);
  }
  getRequestParam() {
    return RequestParam.create(this.annotations);
  }
  getPathVariable() {
    return PathVariable.create(this.annotations);
  }
  getModelAttribute() {
    return ModelAttribute.create(this.annotations);
  }
  getCookieValue() {
    return CookieValue.create(this.annotations);
  }
  getRequestHeader() {
    return RequestHeader.create(this.annotations);
  }
  getRequestMapping() {
    for (const MethodMapping of RequestMapping.alias) {
      const ins = MethodMapping.create(this.annotations);
      if (ins) return ins;
    }
    return null;
  }
}
