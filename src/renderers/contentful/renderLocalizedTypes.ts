/** renders helper types for --localization flag */
export default function renderLocalizedTypes(localization: boolean) {
  if (!localization) return null

  return `
    export type DefaultLocalizedField<T> = Record<CONTENTFUL_DEFAULT_LOCALE_CODE, T>
    export type LocalizedField<T> = DefaultLocalizedField<T> & Partial<Record<LOCALE_CODE, T>>

    // We have to use our own localized version of Asset because of a bug in contentful https://github.com/contentful/contentful.js/issues/208
    export interface Asset {
      sys: Sys
      fields: {
        title: LocalizedField<string>
        description: LocalizedField<string>
        file: LocalizedField<{
          url: string
          details: {
            size: number
            image?: {
              width: number
              height: number
            }
          }
          fileName: string
          contentType: string
        }>
      }
      toPlainObject(): object
    }

    // When you specify a locale in contentful \`client.getEntries\`, the shape of the
    // return value is different. This adapter class unwraps LocalizedField<T> and
    // DefaultLocalizedField<T> to just T. There are also versions for ISomethingFields
    // and Entry<ISomethingFields>
    export type SpecificLocaleField<T> = (
      T extends LocalizedField<infer F> ? F :
      T extends DefaultLocalizedField<infer F> ? F :
      T);

    export type SpecificLocaleFields<T> = { [k in keyof T]: SpecificLocaleField<T[k]> }

    export type SpecificLocale<T extends { fields: any }> = Omit<T, "fields"> & {
      fields: SpecificLocaleFields<T["fields"]>;
    };
  `
}
