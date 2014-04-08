angular
  .module('sails')
  .provider('SailsAPI', function() {



    this.$get = ['SailsHelpers', 'Mime', 'SailsResourceDefaults', function(Helpers, Mime, SailsResourceDefaults) {
      function API(klass, pk) {



        var className  = klass.name.hyphenate();
        var singular   = className.toLowerCase();
        var plural     = singular.pluralize();
        var format;
        var primaryKey = pk || 'id';
        var path = SailsResourceDefaults.pluralize ? plural : singular;

        this.indexURL  = '';
        this.createURL = '';
        this.showURL   = '';
        this.deleteURL = '';
        this.updateURL = '';

        this.set = function(url) {
          if (url.slice(-1) != '/') url = url + '/';
          this.createURL = url + path;
          this.updateURL = this.showURL = this.deleteURL = url + path + '/:' + primaryKey;
          this.indexURL = url + path;
            this.findURL = url + path + '/:' + primaryKey;
          return this;
        };

        this.updatePrimaryKey = function(pk) {
          primaryKey = pk;
          this.updateURL = this.updateURL;
          return this;
        };

        this.format = function(f) {
          Mime.types.register(f);
          if (!f.match(/\.\w+/)) f = '.' + f;
          format = f;
          for (var attr in this) {
            if (attr.match(/URL/)) {
              _.each(Mime.types, function(mimetype) {
                var mimeTypeRegex = new RegExp('.' + mimetype);
                this[attr] = this[attr].replace(mimeTypeRegex, '');
              }, this);
              this[attr] += format;
            };
          };
        };
      }
      return API;
    }];
  });
