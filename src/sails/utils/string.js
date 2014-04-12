angular.module('sails.resource').factory('SailsStringHelpers',function() {

    function Inflections() {

        (function init() {
            this.plurals      = [];
            this.singulars    = [];
            this.uncountables = [];
            this.humans       = [];
            this.acronyms     = {};
            this.acronymRegex = /(?=a)b/;
        }).call(this);

        // Specifies a new acronym. An acronym must be specified as it will appear
        // in a camelized string. An underscore string that contains the acronym
        // will retain the acronym when passed to +camelize+, +humanize+, or
        // +titleize+. A camelized string that contains the acronym will maintain
        // the acronym when titleized or humanized, and will convert the acronym
        // into a non-delimited single lowercase word when passed to +underscore+.
        this.acronym = function(word) {
            this.acronyms[word.downcase()] = word;
            var acronyms = _.values(this.acronyms).join('|');
            this.acronymRegex = new RegExp(acronyms);
        };

        // Specifies a new pluralization rule and its replacement. The rule can
        // either be a string or a regular expression. The replacement should
        // always be a string that may include references to the matched data from
        // the rule.
        this.plural = function(rule, replacement) {
            if (_.isString(rule)) _.without(this.uncountables, rule);
            _.without(this.uncountables, replacement);
            this.plurals.unshift([rule, replacement]);
        };

        // Specifies a new singularization rule and its replacement. The rule can
        // either be a string or a regular expression. The replacement should
        // always be a string that may include references to the matched data from
        // the rule.
        this.singular = function(rule, replacement) {
            if (_.isString(rule)) _.without(this.uncountables, rule);
            _.without(this.uncountables, replacement);
            this.singulars.unshift([rule, replacement]);
        };

        // Specifies a new irregular that applies to both pluralization and
        // singularization at the same time. This can only be used for strings, not
        // regular expressions. You simply pass the irregular in singular and
        // plural form.
        //
        //   irregular 'octopus', 'octopi'
        //   irregular 'person', 'people'
        this.irregular = function(singular, plural) {
            _.without(this.uncountables, singular);
            _.without(this.uncountables, plural);

            var s0    = singular[0];
            var srest = singular.slice(1);

            var p0    = plural[0];
            var prest = plural.slice(1);

            var sReg = '(' + s0 + ')' + srest;
            var pReg = '(' + p0 + ')' + prest;
            this.plural(new RegExp(sReg + '$', 'i'), '$1' + prest);
            this.plural(new RegExp(pReg + '$', 'i'), '$1' + prest);

            this.singular(new RegExp(sReg + '$', 'i'), '$1' + srest);
            this.singular(new RegExp(pReg + '$', 'i'), '$1' + srest);
        };

        // Add uncountable words that shouldn't be attempted inflected.
        //
        //   uncountable 'money'
        //   uncountable 'money', 'information'
        this.uncountable = function() {
            for (var i in arguments) {
                this.uncountables.push(arguments[i]);
            }
        };

    }

    var English = {};

    English.inflections = new Inflections();

    English.inflections.plural(/$/, 's');
    English.inflections.plural(/s$/i, 's');
    English.inflections.plural(/^(ax|test)is$/i, '$1es');
    English.inflections.plural(/(octop)us$/i, '$1i');
    English.inflections.plural(/(vir)us$/i, '$1uses');
    English.inflections.plural(/(alias|status)$/, '$1es');
    English.inflections.plural(/(bu)s$/i, '$1ses');
    English.inflections.plural(/(buffal|tomat)o$/i, '$1oes');
    English.inflections.plural(/([ti])um$/i, '$1a');
    English.inflections.plural(/([ti])a$/i, '$1a');
    English.inflections.plural(/sis$/i, 'ses');
    English.inflections.plural(/(?:([^f])fe|([lr])f)$/i, '$1$2ves');
    English.inflections.plural(/(hive)$/i, '$1s');
    English.inflections.plural(/([^aeiouy]|qu)y$/i, '$1ies');
    English.inflections.plural(/(x|ch|ss|sh)$/i, '$1es');
    English.inflections.plural(/(matr|vert|ind)(?:ix|ex)$/i, '$1ices');
    English.inflections.plural(/^(m|l)ouse$/i, '$1ice');
    English.inflections.plural(/^(m|l)ice$/i, '$1ice');
    English.inflections.plural(/^(ox)$/i, '$1en');
    English.inflections.plural(/^(oxen)$/i, '$1');
    English.inflections.plural(/(quiz)$/i, '$1zes');

    English.inflections.singular(/s$/i, '');
    English.inflections.singular(/(ss)$/i, '$1');
    English.inflections.singular(/(n)ews$/i, '$1ews');
    English.inflections.singular(/([ti])a$/i, '$1um');
    English.inflections.singular(/((a)naly|(b)a|(d)iagno|(p)arenthe|(p)rogno|(s)ynop|(t)he)(sis|ses)$/i, '$1sis');
    English.inflections.singular(/(^analy)(sis|ses)$/i, '$1sis');
    English.inflections.singular(/([^f])ves$/i, '$1fe');
    English.inflections.singular(/(hive)s$/i, '$1');
    English.inflections.singular(/(tive)s$/i, '$1');
    English.inflections.singular(/([lr])ves$/i, '$1f');
    English.inflections.singular(/(c[lr])oves$/i, '$1ove');
    English.inflections.singular(/([^aeiouy]|qu)ies$/i, '$1y');
    English.inflections.singular(/(s)eries$/i, '$1eries');
    English.inflections.singular(/(m)ovies$/i, '$1ovie');
    English.inflections.singular(/(x|ch|ss|sh)es$/i, '$1');
    English.inflections.singular(/^(m|l)ice$/i, '$1ouse');
    English.inflections.singular(/(bus)(es)?$/i, '$1');
    English.inflections.singular(/(o)es$/i, '$1');
    English.inflections.singular(/^(toe)s$/i, '$1');
    English.inflections.singular(/(shoe)s$/i, '$1');
    English.inflections.singular(/(cris|test)(is|es)$/i, '$1is');
    English.inflections.singular(/^(a)x[ie]s$/i, '$1xis');
    English.inflections.singular(/(octop|vir)(us|i)$/i, '$1us');
    English.inflections.singular(/(alias|status)(es)?$/i, '$1');
    English.inflections.singular(/^(ox)en/i, '$1');
    English.inflections.singular(/(vert|ind)ices$/i, '$1ex');
    English.inflections.singular(/(matr)ices$/i, '$1ix');
    English.inflections.singular(/(quiz)zes$/i, '$1');
    English.inflections.singular(/(database)s$/i, '$1');

    English.inflections.irregular('person', 'people');
    English.inflections.irregular('man', 'men');
    English.inflections.irregular('child', 'children');
    English.inflections.irregular('sex', 'sexes');
    English.inflections.irregular('move', 'moves');
    English.inflections.irregular('zombie', 'zombies');

    English.inflections.acronym('HTML');

    English.inflections.uncountable('equipment',
        'information', 'rice', 'money', 'species', 'series', 'fish',
        'sheep', 'jeans', 'police');

    var STRPROTO = String.prototype;

    function isRegExp(test) {
        return test instanceof RegExp;
    };

    Object.defineProperty(STRPROTO, 'gsub', {
        enumerable: false,
        value: function (regex, w) {
            var r = regex.toString().replace(/^\//, '').replace(/\/$/, '');
            return this.replace(new RegExp(r, 'g'), w);
        }
    });

    Object.defineProperty(STRPROTO, 'sub', {
        enumerable: false,
        value: function (test, rep) {
            var regex;
            if (isRegExp(test))    regex = test;
            if (!isRegExp(test))   regex = new RegExp(test);
            if (this.match(regex)) return this.replace(regex, rep);
        }
    });

    Object.defineProperty(STRPROTO, 'isEmpty', {
        enumerable: false,
        value: function () {
            return this.length === 0;
        }
    });

    Object.defineProperty(STRPROTO, 'pluralize', {
        enumerable: false,
        value: function (number) {
            if (number == 1) return this;
            return applyInflections(this, English.inflections.plurals);
        }
    });

    Object.defineProperty(STRPROTO, 'singularize', {
        enumerable: false,
        value: function () {
            return applyInflections(this, English.inflections.singulars);
        }
    });


    function applyInflections(word, rules) {
        var returner, result;
        returner = result = _.clone(word.toString());
        if (result.isEmpty() || _.include(English.inflections.uncountables, result.toLowerCase())) return result;
        for (var i in rules) {
            var rule = rules[i][0];
            var replacement = rules[i][1];
            if (result.sub(rule, replacement)) {
                returner = result.sub(rule, replacement);
                break;
            }
        }
        return returner;
    };

    Object.defineProperty(STRPROTO, 'capitalize', {
        enumerable: false,
        value: function () {
            return this[0].toUpperCase() + this.slice(1).toLowerCase();
        }
    });

    Object.defineProperty(STRPROTO, 'camelize', {
        enumerable: false,
        value: function () {
            var string = _.clone(this);
            if (!string.match(/[A-Z][a-z]/)) {
                string = string.replace(/[a-z\d]+/g, function (t) {
                    return t.capitalize();
                });
            }
            string = string[0].downcase() + string.slice(1);
            string = string.replace(/(?:_|(\/))([a-z\d]*)/gi, "$1" +
                (English.inflections.acronyms["$2"] || "$2".capitalize()));
            return string;
        }
    });

    Object.defineProperty(STRPROTO, 'underscore', {
        enumerable: false,
        value: function () {
            var word = _.clone(this);
            var regex = new RegExp('(?:([A-Za-z\d])|^)' + English.inflections.acronymRegex + '(?=\b|[^a-z])', 'g');
            word = word.replace(regex, '$1$1_$2');
            word = word.replace(/([A-Z\d]+)([A-Z][a-z])/g, '$1_$2');
            word = word.replace(/([a-z\d])([A-Z])/g, '$1_$2');
            word = word.toLowerCase();
            return word;
        }
    });

    Object.defineProperty(STRPROTO, 'hyphenate', {
        enumerable: false,
        value: function () {
            var word = _.clone(this);
            word = word.underscore();
            word = word.replace(/\_/g, '-');
            return word;
        }
    });

// Capitalizes the first word and turns underscores into spaces and strips a
// trailing "_id", if any. Like +titleize+, this is meant for creating pretty
// output.
//
//   'employee_salary'.humanize # => "Employee salary"
//   'author_id'.humanize       # => "Author"
    Object.defineProperty(STRPROTO, 'humanize', {
        enumerable: false,
        value: function () {
            var word = _.clone(this);
            word = word.underscore();
            word = word.gsub(/_id$/, '');
            word = word.gsub(/\_/, ' ');
            word = word.gsub(/([a-z\d])*/i, function (t) {
                return English.inflections.acronyms[t] || t.toLowerCase();
            });
            word = word.replace(/^\w/, function (t) {
                return t.capitalize();
            });
            return word;
        }
    });

// # Capitalizes all the words and replaces some characters in the string to
// # create a nicer looking title. +titleize+ is meant for creating pretty
// # output. It is not used in the Rails internals.
// #
// # +titleize+ is also aliased as +titlecase+.
// #
// #   'man from the boondocks'.titleize   # => "Man From The Boondocks"
// #   'x-men: the last stand'.titleize    # => "X Men: The Last Stand"
// #   'TheManWithoutAPast'.titleize       # => "The Man Without A Past"
// #   'raiders_of_the_lost_ark'.titleize  # => "Raiders Of The Lost Ark"
    Object.defineProperty(STRPROTO, 'titleize', {
        enumerable: false,
        value: function () {
            return this.humanize().replace(/\b(\w+)/g,
                function (a) {
                    return a.capitalize();
                })
        }
    });

    Object.defineProperty(STRPROTO, 'titlecase', {
        enumerable: false,
        value: function () {
            return this.titleize();
        }
    });

    Object.defineProperty(STRPROTO, 'classify', {
        enumerable: false,
        value: function () {
            var camelized = this.singularize().camelize().replace(/.*\./, '');
            return camelized[0].capitalize() + camelized.slice(1);
        }
    });

    Object.defineProperty(STRPROTO, 'downcase', {
        enumerable: false,
        value: function () {
            return this.toLowerCase();
        }
    });

    Object.defineProperty(STRPROTO, 'toForeignKey', {
        enumerable: false,
        value: function () {
            return this.underscore() + '_id';
        }
    });

    Object.defineProperty(STRPROTO, 'ordinalize', {
        enumerable: false,
        value: function () {
            var number = Number(this);

            if (_.include([11, 12, 13], number % 100)) {
                return number + 'th';
            } else {
                var remain = number % 10;
                if (remain == 1) return number + 'st';
                if (remain == 2) return number + 'nd';
                if (remain == 3) return number + 'rd';
                return number + 'th';
            }
        }
    });
});