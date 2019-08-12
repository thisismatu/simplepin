import { Readability, JSDOMParser } from 'readability-node'
import { DOMParser, XMLSerializer } from 'xmldom-silent'
import SanitizeHtml from 'sanitize-html'
import UrlParser from 'url-parse'

const convertHtmlToXhtml = html => {
  const xmlSerializer = new XMLSerializer()
  const xhtmlDocument = new DOMParser({
    errorHandler: (level, msg) => {
      if (level === 'error') {
        throw new Error(`Unable to convert HTML to XHTML: ${msg}`)
      }
    },
  }).parseFromString(html, 'text/html')
  return xmlSerializer.serializeToString(xhtmlDocument)
}

const createJsDomDocument = xhtml => {
  const jsDomParser = new JSDOMParser()
  const doc = jsDomParser.parse(xhtml.trim())
  if (jsDomParser.errorState) {
    throw new Error(`Unable to parse XHTML into JsDom${jsDomParser.errorState}`)
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
    pathBase: `${sourceUrlParsed.protocol}//${sourceUrlParsed.host}${sourceUrlParsed.pathname.substring(0, sourceUrlParsed.pathname.lastIndexOf('/') + 1)}`, // eslint-disable-line max-len
  }
}

const cleanHtml = (html, sourceUrl) => {
  const sanitizedHtml = SanitizeHtml(html, {
    allowedTags: ['html', 'body', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'p',
      'a', 'ul', 'ol', 'li', 'dl', 'dt', 'dd', 'b', 'i', 'strong', 'em', 'code', 'hr',
      'br', 'div', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'pre', 'figure', 'img'],
    allowedAttributes: {
      a: ['href', 'name', 'target'],
      img: ['src'],
    },
    selfClosing: ['img', 'br', 'hr'],
    nonTextTags: ['style', 'script', 'textarea', 'noscript', 'header', 'footer', 'form', 'button', 'h1'],
  })

  return new Promise(resolve => {
    if (!sanitizedHtml || sanitizedHtml.length === 0) throw new Error('Invalid or no html provided')
    if (!sourceUrl || sourceUrl.length === 0) throw new Error('Invalid or no source url provided')

    const readabilityUrl = createReadabilityUrl(sourceUrl)
    const xhtml = convertHtmlToXhtml(sanitizedHtml)
    const doc = createJsDomDocument(xhtml)
    let cleanedHtml
    try {
      const readability = new Readability(readabilityUrl, doc)
      if (readability) {
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
        html {
          box-sizing: border-box;
          font-size: 16px;
        }

        body {
          background-color: #fff;
          color: #111;
          font-family: -apple-system, BlinkMacSystemFont, 'Roboto', 'Helvetica Neue', 'Helvetica', 'Arial', sans-serif;
          font-size: 1rem;
          font-weight: 400;
          line-height: 1.5;
          margin: 0;
          padding: 0;
          text-rendering: optimizeLegibility;
          overflow-x: hidden;
        }

        .wrapper {
          padding: 0 1rem;
          overflow-x: hidden;
        }

        h1,
        h2,
        h3,
        h4,
        h5,
        h6 {
          font-weight: 700;
          line-height: 1.375;
          margin-top: 1.5rem;
          margin-bottom: 1rem;
        }

        h1 {
          font-size: 1.5rem;
          line-height: 1.25;
        }

        h2 {
          font-size: 1.375rem;
        }

        h3 {
          font-size: 1.25rem;
        }

        h4 {
          font-size: 1.125rem;
        }

        h5,
        h6 {
          font-size: 1rem;
        }

        blockquote {
          font-style: italic;
        }

        blockquote > *:first-child {
          margin-top: 0;
        }

        blockquote > *:last-child {
          margin-bottom: 0;
        }

        code {
          background: #F0F0F0;
          border-radius: 2px;
          font-size: 0.875rem;
          margin: 0 2px;
          padding: 3px 6px;
          white-space: normal;
        }

        pre {
          background: #F0F0F0;
          border-radius: .25rem;
          overflow-y: hidden;
        }

        pre > code {
          border-radius: 0;
          display: block;
          padding: 1rem;
          white-space: pre;
        }

        hr {
          height: 1px;
          background-color: #E5E5E5;
          border: none;
          margin: 1.5rem 0;
        }

        a {
          color: #0066CC;
          text-decoration: none;
        }

        ol,
        ul {
          padding-left: 1.25rem;
        }

        dt {
          font-weight: 700;
        }

        dd,
        dt,
        li {
          margin: 1rem 0;
        }

        blockquote,
        dl,
        figure,
        ol,
        p,
        pre,
        table,
        ul {
          margin: 1.25rem 0;
        }

        table {
          border-collapse: collapse;
          border-spacing: 0;
          width: 100%;
        }

        td,
        th {
          border: none;
          padding: 0.5rem;
          text-align: left;
        }

        td:first-child,
        th:first-child {
          padding-left: 0;
        }

        td:last-child,
        th:last-child {
          padding-right: 0;
        }

        b,
        strong {
          font-weight: bold;
        }

        figure {
          display: block;
          margin: 1em 0;
        }

        figure > :is(p, span, div),
        figcaption {
         font-style: italic;
         color: #757575;
        }

        img {
          display: inline-block;
          max-width: 100%;
          height: auto;
          border: 0;
          vertical-align: top;
        }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <h1>${title}</h1>
        <hr>
        ${body}
      </div>
    </body>
  </html>`
}

export default {
  cleanHtml,
  cleanHtmlTemplate,
}
