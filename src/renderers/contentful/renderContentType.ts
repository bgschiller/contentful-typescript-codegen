import { FieldType } from "contentful"
import { ContentType, ContentFields } from "contentful-management"

import renderInterface from "../typescript/renderInterface"
import renderField from "./renderField"
import renderContentTypeId from "./renderContentTypeId"

import renderArray from "./fields/renderArray"
import renderBoolean from "./fields/renderBoolean"
import renderLink from "./fields/renderLink"
import renderLocation from "./fields/renderLocation"
import renderNumber from "./fields/renderNumber"
import renderObject from "./fields/renderObject"
import renderRichText from "./fields/renderRichText"
import renderSymbol from "./fields/renderSymbol"

export default function renderContentType(contentType: ContentType, localization: boolean): string {
  const name = renderContentTypeId(contentType.sys.id)
  const fields = renderContentTypeFields(contentType.fields, localization)
  const sys = renderSys(contentType.sys)

  return `
    ${renderInterface({ name: `${name}Fields`, fields })}

    ${descriptionComment(contentType.description)}
    ${renderInterface({ name, extension: `Entry<${name}Fields>`, fields: sys })}
  `
}

function descriptionComment(description: string | undefined) {
  if (description) {
    return `/** ${description} */`
  }

  return ""
}

function renderContentTypeFields(fields: ContentFields[], localization: boolean): string {
  return fields
    .filter(field => !field.omitted)
    .map<string>(field => {
      const functionMap: Record<FieldType, (field: ContentFields) => string> = {
        Array: renderArray,
        Boolean: renderBoolean,
        Date: renderSymbol,
        Integer: renderNumber,
        Link: renderLink,
        Location: renderLocation,
        Number: renderNumber,
        Object: renderObject,
        RichText: renderRichText,
        Symbol: renderSymbol,
        Text: renderSymbol,
      }

      return renderField(field, functionMap[field.type as FieldType](field), localization)
    })
    .join("\n\n")
}

function renderSys(sys: ContentType["sys"]) {
  return `
    sys: {
      id: string;
      type: string;
      createdAt: string;
      updatedAt: string;
      locale: string;
      contentType: {
        sys: {
          id: '${sys.id}';
          linkType: 'ContentType';
          type: 'Link';
        }
      }
    }
  `
}
