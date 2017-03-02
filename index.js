module.exports = {
	URL: URL,
	QueryString: QueryString
}

function QueryString(qs) {
    var elements;

    this.parse = function(qs) {
        qs = String(qs || '').replace(/^\?/,'');
        elements = (qs.length) ? qs.split('&') : [];
    }
    this.parse(qs);

    function parseElement(e) {
        vars = e.split('=');

        try {   // decodeURIComponent does not like malformed elements, so we try...catch
            vars[0] = decodeURIComponent(vars[0]);
            vars[1] = decodeURIComponent(vars[1]).replace(/"/g,'\\"').replace(/\+/g,' ')
        } catch (x) {}

        return [vars[0], vars[1]];
    }

    this.get = function(varname, defval) {
        for (var i = 0; i < elements.length; i++) {
            var e = parseElement(elements[i]);
            if (e[0] === varname) {
                return e[1]
            }
        }
        return defval || '';
    }

    this.remove = function(varname) {
        for (var i = elements.length - 1; i > -1; i--) {
            var e = parseElement(elements[i]);
            if (e[0] === varname) {
                elements.splice(i, 1);
            }
        }
    }

    this.add = function(varname, value, replace) {
        if (replace) {
            this.remove(varname);
        }
        elements.push(encodeURIComponent(varname) + '=' + encodeURIComponent(value))
    }

    this.toObject = function(asArrays) {
        var res = {};

        for (var i = elements.length - 1; i > -1; i--) {
            var e = parseElement(elements[i]);
            if (asArrays) {
                (res[e[0]] = res[e[0]] || []).push(e[1]);
            } else {
                res[e[0]] = e[1];
            }
        }

        return res;
    };

    this.toString = function() {
        return elements.length ? ('?' + elements.join('&')) : '';
    };
}

function URL(url) {
    this.parse = function(url) {
        var a = this.A(url);

        this.protocol = a.protocol.replace(':','');
        this.host = a.hostname;
        this.port = a.port;
        this.path = a.pathname.replace(/^([^/])/,'/$1');
        this.query = new QueryString(a.search);
        this.hash = a.hash.replace('#','');
    }

    // this.file = (a.pathname.match(/\/([^\/?#]+)$/i) || [,''])[1];
    // this.segments = a.pathname.replace(/^\//,'').split('/');

    this.toString = function() {        
        return this.protocol + '://' + this.host
                                     + (this.port ? (':' + this.port) : '')
                                     + this.path
                                     + this.query
                                     + (this.hash ? ('#' + this.hash) : '');
    }

    this.A = function(url) {
        var a = document.createElement('a');
        a.href = url || this.toString();
        return a;
    }

    this.parse(url);
};
