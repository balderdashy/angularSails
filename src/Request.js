class Request extends Body {

  constructor(url,options){
    options = options || {}
    this.url = url
    this._body = options.body
    this.credentials = options.credentials || null
    this.headers = new Headers(options.headers)
    this.method = normalizeMethod(options.method || 'GET')
    this.mode = options.mode || null
    this.referrer = null
  }

}
