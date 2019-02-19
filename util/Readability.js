import { Readability, JSDOMParser } from 'readability-node'
import { DOMParser, XMLSerializer } from 'xmldom-silent'
import SanitizeHtml from 'sanitize-html'
import UrlParser from 'url-parse'

const convertHtmlToXhtml = html => {
  const xmlSerializer = new XMLSerializer()
  const xhtmlDocument = new DOMParser({
    errorHandler: (level, msg) => {
      if (level === 'error') {
        throw new Error('Unable to convert HTML to XHTML: ' + msg)
      }
    },
  }).parseFromString(html, 'text/html')
  return xmlSerializer.serializeToString(xhtmlDocument)
}

const createJsDomDocument = xhtml => {
  const jsDomParser = new JSDOMParser()
  const doc = jsDomParser.parse(xhtml.trim())
  if (jsDomParser.errorState) {
    throw new Error('Unable to parse XHTML into JsDom' + jsDomParser.errorState)
  }
  return doc
}

const createReadabilityUrl = sourceUrl => {
  const sourceUrlParsed = new UrlParser(sourceUrl)
  if (!sourceUrlParsed || sourceUrlParsed.host.length === 0) {
    throw new Error('Invalid or no source url provided')
  }
  return {
    spec: sourceUrlParsed.href,
    host: sourceUrlParsed.host,
    scheme: sourceUrlParsed.protocol.slice(0, -1),
    prePath: `${sourceUrlParsed.protocol}//${sourceUrlParsed.host}`,
    pathBase: `${sourceUrlParsed.protocol}//${sourceUrlParsed.host}${sourceUrlParsed.pathname.substring(0, sourceUrlParsed.pathname.lastIndexOf('/') + 1)}`,
  }
}

const cleanHtml = (html, sourceUrl) => {
  html = SanitizeHtml(html, {
    allowedTags: [ 'html','body', 'p', 'h1', 'h2', 'h3','h4','section', 'div', 'span'],
    nonTextTags: [ 'style', 'script', 'textarea', 'noscript', 'html', 'body', 'div', 'span', 'h1'],
  })

  return new Promise(resolve => {
    if (!html || html.length === 0) {
      throw new Error('Invalid or no html provided')
    }

    if (!sourceUrl || sourceUrl.length === 0) {
      throw new Error('Invalid or no source url provided')
    }
    const readabilityUrl = createReadabilityUrl(sourceUrl)
    const xhtml = convertHtmlToXhtml(html)
    const doc = createJsDomDocument(xhtml)
    let cleanedHtml
    try {
      const readability = new Readability(readabilityUrl, doc)
      if(readability) {
        cleanedHtml = readability.parse()
      }
    } catch (error) {
      throw new Error('Unable to clean HTML')
    }
    resolve(cleanedHtml)
  })
}

const cleanHtmlTemplate = (title, body) => {
  return `
  <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>
        body {
          background: red,
        }
      </style>
    </head>
    <body>
      <h1>${title}</h1>
      ${body}
    </body>
  </html>`
}

export default {
  cleanHtml,
  cleanHtmlTemplate,
}
