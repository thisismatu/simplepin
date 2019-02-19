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
    allowedTags: [ 'html','body', 'p', 'strong', 'em', 'h1', 'h2', 'h3', 'h4', 'section', 'div', 'span', 'blockquote', 'img', 'hr'],
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
            font-family: -apple-system,BlinkMacSystemFont, roboto, noto, sans-serif;
            background-color: #fff;
            line-height: 1.5;
            font-size: 16px;
            color: #222;
            text-rendering: optimizeLegibility;
            padding: 16px;
            margin: 0;
        }
        h1, h2, h3, h4 {
            font-weight: 700;
            line-height: 1.334;
        }
        h1 {
            font-size: 1.6em;
            line-height: 1.25;
        }
        h2 {
            font-size: 1.4em;
        }
        h3 {
            font-size: 1.2em;
        }
        h4 {
          font-size: 1em;
        }
        hr {
            height: 1px;
            background-color: #E5E5E5;
            border: none;
            width: 100%;
            margin: 0px;
        }
        img {
            max-width: 100%;
            margin: 0.5em 0;
        }
        li {
            line-height: 1.5em;
        }
        td {
            border: 1px solid black;
            padding: 3px 7px;
        }
        pre {
            background-color: #E0E0E0;
            padding: 10px;
            overflow: auto;
        }
        blockquote {
            border-left: 4px solid;
            margin-left: 0;
            padding: 15px 10% 15px 8%;
            margin: 1em 0;
            font-size: 1.2em;
            line-height: 1.4;
        }
        blockquote > *:first-child {
            margin-top: 0;
        }
        blockquote > *:last-child {
            margin-bottom: 0;
        }
      </style>
    </head>
    <body>
      <h1>${title}</h1>
      <hr>
      ${body}
    </body>
  </html>`
}

export default {
  cleanHtml,
  cleanHtmlTemplate,
}
