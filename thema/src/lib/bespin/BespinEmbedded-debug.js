if (typeof bespin === "undefined") bespin = {};
if (typeof document !== "undefined") {
    var link = document.getElementById("bespin_base");
    if (link) {
        var href = link.href;
        bespin.base = href.substring(href.length - 1) !== "/" ? href + "/" : href
    } else bespin.base = ""
}(function () {
    if ("undefined" === typeof y) var y = function () {
        function j(w, t) {
            x.push({
                m: w,
                a: t
            })
        }
        var x = [],
            E = {
                isBootstrap: true,
                queue: x,
                register: function (w, t) {
                    if (w.match(/^tiki/) && this.ENV) if (this.ENV.app === "tiki" && this.ENV.mode === "test") {
                        if (!t.dependencies) t.dependencies = {};
                        t.dependencies.core_test = "~"
                    }
                    j("register", arguments);
                    return this
                },
                module: function (w, t) {
                    if (w.match(/\:tiki$/)) this.tikiFactory = t;
                    j("module", arguments);
                    return this
                },
                start: function () {
                    var w = {};
                    this.tikiFactory(null, w, null);
                    w = w.Browser.start(this.ENV, this.ARGS, x);
                    x = null;
                    return w
                }
            };
        if ("undefined" !== typeof ENV) E.ENV = ENV;
        if ("undefined" !== typeof ARGV) E.ARGS = ARGV;
        if ("undefined" !== typeof ARGS) E.ARGS = ARGS;
        return E
    }();
    y.register("::tiki/1.0.0", {
        name: "tiki",
        version: "1.0.0"
    });
    y.module("::tiki/1.0.0:tiki", function (j, x) {
        var E = /^::/,
            w = function (a) {
                return !!E.exec(a)
            },
            t = function () {
                x.debug.apply(this, arguments)
            };
        x.debug = function () {
            var a = Array.prototype.join.call(arguments, "");
            j("sys").debug(a)
        };
        var h;
        h = Array.isArray ? Array.isArray : function (a) {
            if ("object" !== typeof a) return false;
            if (a instanceof Array) return true;
            return a.constructor && a.constructor.name === "Array"
        };x.isArray = h;
        var o;
        if (Object.create) o = Object.create;
        else {
            var s = function () {},
                C = s.prototype;
            o = function (a) {
                if (!a) a = Object.prototype;
                s.prototype = a;
                var b = new s;
                b.prototype = a;
                s.prototype = C;
                return b
            }
        }
        x.createObject = o;
        var v, B, F;v = function () {
            return function () {
                return this.init ? this.init.apply(this, arguments) : this
            }
        };B = function () {
            return F(this)
        };F = function (a) {
            var b = v();
            b.prototype = o(a.prototype);
            b.prototype.constructor = b;
            b.super_ =
            a;
            b.extend = B;
            return b
        };x.extend = F;
        var f = function (a, b) {
            if (b && !b.displayName) b.displayName = "parallel#fn";
            return function (c) {
                if (a.length === 0) return c(null, []);
                var d = a.length,
                    l = d,
                    m = false,
                    z, D = function (H) {
                        if (!m) {
                            if (H) {
                                m = true;
                                return c(H)
                            }--l <= 0 && c()
                        }
                    };
                D.displayName = "parallel#tail";
                for (z = 0; z < d; z++) b(a[z], D)
            }
        };f.displayName = "parallel";
        var g;g = Array.prototype.map ?
        function (a, b) {
            return a.map(b)
        } : function (a, b) {
            var c, d = a.length,
                l = [];
            for (c = 0; c < d; c++) l[c] = b(a[c], c);
            return l
        };g.displayName = "map";
        var n = function (a, b) {
            var c = "pending",
                d = [],
                l = false,
                m = null,
                z = function (D) {
                    b || (b = this);
                    switch (c) {
                    case "ready":
                        D.apply(null, m);
                        break;
                    case "running":
                        d.push(D);
                        break;
                    case "pending":
                        d.push(D);
                        c = "running";
                        a.call(b, function () {
                            m = Array.prototype.slice.call(arguments);
                            var H = d,
                                M = m;
                            if (l) {
                                c = "pending";
                                d = [];
                                m = null;
                                l = false
                            } else {
                                c = "ready";
                                d = null
                            }
                            H && H.forEach(function (O) {
                                O.apply(null, M)
                            })
                        });
                        break
                    }
                    return this
                };
            z.displayName = "once#handler";
            z.reset = function () {
                switch (c) {
                case "ready":
                    c = "pending";
                    d = [];
                    m = null;
                    break;
                case "running":
                    l = true;
                    break
                }
            };
            z.reset.displayName = "once#handler.reset";
            return z
        };x.once = n;
        var p = function (a, b) {
            var c, d;
            for (c in a) if (a.hasOwnProperty(c)) {
                d = a[c];
                if ("function" === typeof d) if (!d.displayName) {
                    d.displayName = b ? b + "." + c : c;p(d.prototype, d.displayName)
                }
            }
            return a
        },
            u = F(Error);u.prototype.init = function (a, b) {
            a = a + " not found";
            if (b) a = "string" === typeof b ? a + " " + b : a + " in package " + (b.id || "(unknown)");this.message = a;
            return this
        };x.NotFound = u;
        var A = F(Error);A.prototype.init = function (a, b) {
            if ("undefined" !== typeof JSON) a = JSON.stringify(a);
            this.message = "Invalid package definition. " + b + " " + a
        };x.InvalidPackageDef = A;
        var L = function () {
            var a = function (d) {
                return d.charCodeAt(0) <= 32
            },
                b = function (d) {
                    d = d.charCodeAt(0);
                    return d >= 48 && d <= 57
                },
                c = function (d, l) {
                    for (var m = 0, z = 0, D = 0, H, M;; z++, D++) {
                        H = d.charAt(z);
                        M = l.charAt(D);
                        if (!b(H) && !b(M)) return m;
                        else if (b(H)) if (b(M)) {
                            if (H < M) if (m === 0) m = -1;
                            else if (H > M) if (m === 0) m = +1;
                            else if (H === 0 && M === 0) return m
                        } else return +1;
                        else return -1
                    }
                };
            return function (d, l) {
                for (var m = 0, z = 0, D = 0, H = 0, M, O, W;;) {
                    D = H = 0;
                    M = d.charAt(m);
                    for (O =
                    l.charAt(z); a(M) || M == "0";) {
                        if (M == "0") D++;
                        else D = 0;
                        M = d.charAt(++m)
                    }
                    for (; a(O) || O == "0";) {
                        if (O == "0") H++;
                        else H = 0;
                        O = l.charAt(++z)
                    }
                    if (b(M) && b(O)) if ((W = c(d.substring(m), l.substring(z))) !== 0) return W;
                    if (M === 0 && O === 0) return D - H;
                    if (M < O) return -1;
                    else if (M > O) return +1;
                    ++m;
                    ++z
                }
            }
        }();x.natcompare = L;
        var I = function (a) {
            return new Error("" + a + " is an invalid version string")
        };I.displayName = "invalidVers";
        var N = function (a, b, c, d) {
            c = Number(c);
            d = Number(d);
            if (isNaN(c)) throw I(a);
            if (isNaN(d)) throw I(b);
            return c - d
        };N.displayName = "compareNum";
        var i, J = {
            parse: function (a) {
                a = a.match(/^(=|~)?([\d]+?)(\.([\d]+?)(\.(.+))?)?$/);
                if (!a) return null;
                return [a, a[2], a[4] || "0", a[6] || "0", a[1]]
            },
            major: function (a) {
                return Number(i(a)[1])
            },
            minor: function (a) {
                return Number(i(a)[2])
            },
            patch: function (a) {
                a = i(a)[3];
                return isNaN(Number(a)) ? a : Number(a)
            },
            STRICT: "strict",
            NORMAL: "normal",
            mode: function (a) {
                return i(a)[4] === "=" ? J.STRICT : J.NORMAL
            },
            comparePatch: function (a, b) {
                var c, d;
                if (a === b) return 0;
                c = Number(a);
                d = Number(b);
                return isNaN(c) ? isNaN(d) ? L(a, b) : -1 : isNaN(d) ? 1 : c < d ? -1 : c > d ? 1 : 0
            },
            compare: function (a, b) {
                var c;
                if (a === b) return 0;
                if (a) a = i(a);
                if (b) b = i(b);
                if (!a && !b) return 0;
                if (!a) return -1;
                if (!b) return 1;
                c = N(a[0], b[0], a[1], b[1]);
                if (c === 0) {
                    c = N(a[0], b[0], a[2], b[2]);
                    if (c === 0) c = J.comparePatch(a[3], b[3])
                }
                return c < 0 ? -1 : c > 0 ? 1 : 0
            },
            compatible: function (a, b) {
                if (!a) return true;
                if (a === b) return true;
                if (a && !i(a)) a = null;
                if (b && !i(b)) b = null;
                if (!a) return true;
                if (a === b) return true;
                if (J.mode(a) === J.STRICT) return b && J.compare(a, b) === 0;
                else {
                    if (!b) return true;
                    if (J.major(a) !== J.major(b)) return false;
                    return J.compare(a, b) <= 0
                }
            },
            normalize: function (a) {
                var b;
                if (!a || a.length === 0) return null;
                a = J.parse(a);
                if (!a) return null;
                b = Number(a[3]);
                if (isNaN(b)) b = a[3];
                return [Number(a[1]), Number(a[2]), b].join(".")
            }
        };x.semver = J;i = J.parse;
        var U = x.extend(Object);x.Factory = U;U.prototype.init = function (a, b, c) {
            this.id = a;
            this.pkg = b;
            this.factory = c
        };U.prototype.call = function (a, b) {
            var c = this.factory,
                d = this.__filename,
                l = this.__dirname;
            if ("string" === typeof c) c = this.factory = U.compile(c, this.pkg.id + ":" + this.id);
            a = a.createRequire(b);
            var m = b.exports;
            c.call(m, a, m, b, d, l);
            return b.exports
        };
        var R = ["(function(require, exports, module) {", null, "\n});\n//@ sourceURL=", null, "\n"];U.compile = function (a, b) {
            R[1] = a;
            R[3] = b || "(unknown module)";
            a = R.join("");
            a = eval(a);
            R[1] = R[3] = null;
            return a
        };x.Factory = U;
        var S = x.extend(Object);x.Module = S;S.prototype.init = function (a, b, c) {
            this.id = a;
            this.ownerPackage = b;
            this.exports = {};
            var d = this;
            this.resource = function (l) {
                return c.resource(l, d.id, b)
            }
        };
        var Q = x.extend(Object);x.Package = Q;Q.prototype.init = function (a, b) {
            w(a) || (a = "::" + a);
            this.id = a;
            this.config = b;
            this.isReady = true
        };Q.prototype.get = function (a) {
            return this.config ? this.config[a] : undefined
        };Q.prototype.set = function (a, b) {
            if (!this.config) this.config = {};
            this.config[a] = b;
            return this
        };Q.prototype.requiredVersion = function (a) {
            var b = this.get("dependencies");
            return b ? b[a] : null
        };Q.prototype.canonicalPackageId = function (a, b) {
            if (a === this.get("name") && J.compatible(b, this.get("version"))) return this.id;
            return null
        };Q.prototype.packageFor = function (a) {
            if (a === this.id) return this;
            return null
        };Q.prototype.ensurePackage = function (a, b) {
            return a === this.id ? b() : b(new u(a, this))
        };Q.prototype.catalogPackages = function () {
            return [this]
        };Q.prototype.exists = function (a) {
            return !!(this.factories && this.factories[a])
        };Q.prototype.load = function (a) {
            return this.factories ? this.factories[a] : null
        };
        var e = function (a, b) {
            return a + ":" + b
        },
            k = x.extend(Object);x.Loader = k;k.prototype.init = function (a) {
            this.sources = a || [];
            this.clear()
        };k.prototype.clear = function () {
            this.factories = {};
            this.canonicalIds = {};
            this.packages = {};
            this.packageSources = {};
            this.canonicalPackageIds = {}
        };k.prototype.defaultPackage = new Q("default", {
            name: "default"
        });k.prototype.anonymousPackage = new Q("(anonymous)", {
            name: "(anonymous)"
        });k.prototype.canonical = function (a, b, c) {
            var d, l, m, z;
            if (b && "string" !== typeof b) {
                c = b;
                b = null
            }
            if (w(a)) return a;
            if (!c) c = this.anonymousPackage;
            a = this._resolve(a, b, c);
            if (w(a)) return a;
            d = c ? c.id : "(null)";b = this.canonicalIds;
            if (!b) b = this.canonicalIds = {};b[d] || (b[d] = {});b = b[d];
            if (b[a]) return b[a];d = a;l = a.indexOf(":");
            if (l >= 0) {
                m =
                a.slice(0, l);
                a = a.slice(l + 1);
                if (a[0] === "/") throw new Error("Absolute path not allowed with packageId");
            }
            l = null;
            if (m && m.length > 0) {
                if (m = this._canonicalPackageId(m, null, c)) l = e(m, a)
            } else {
                if (c && c.exists(a)) l = e(c.id, a);
                else {
                    if (m = this._canonicalPackageId(a, null, c)) z = this._packageFor(m, c);
                    if (z) if (z.exists("index")) l = e(z.id, "index");
                    else if (z.exists(a)) l = e(z.id, a)
                }
                if (!l) {
                    if (this.defaultPackage) m = this.defaultPackage.id;
                    else if (this.workingPackage) m = this.workingPackage.id;
                    else if (this.anonymousPackage) m = this.anonymousPackage.id;
                    else return null;
                    if (m) l = e(m, a)
                }
            }
            return b[d] = l
        };k.prototype.load = function (a, b, c) {
            var d, l, m;
            if (!b) b = this.anonymousPackage;
            d = this.factories;
            if (!d) d = this.factories = {};
            if (d[a]) return d[a];
            l = a.indexOf(":", 2);
            m = a.slice(0, l);
            l = a.slice(l + 1);
            (b = this._packageFor(m, b)) || t("Loader#load - " + m + " not found for " + l);
            if (!b) return null;
            c = b.load(l, c);
            return d[a] = c
        };k.prototype.catalogPackages = function (a) {
            if (!a) a = this.anonymousPackage;
            var b = [],
                c, d, l = {};
            this.defaultPackage && b.push(this.defaultPackage);
            var m = function (z) {
                var D, H, M, O;
                if (z) {
                    H = z.length;
                    for (D = 0; D < H; D++) {
                        O = z[D];
                        (M = l[O.get("name")]) || (M = l[O.get("name")] = {});
                        if (!M[O.get("version")]) {
                            b.push(O);
                            M[O.get("version")] = O
                        }
                    }
                }
            };
            a && m(a.catalogPackages());
            a = this.sources;
            d = a.length;
            for (c = 0; c < d; c++) m(a[c].catalogPackages());
            l = null;
            return b
        };k.prototype.canonicalPackageId = function (a, b, c) {
            var d;
            if (a instanceof Q) return a.id;
            if (w(a)) {
                d = a.indexOf(":", 2);
                if (d >= 0) a = a.slice(0, d);
                return a
            }
            if (b && "string" !== typeof b) {
                c = b;
                b = null
            }
            if (!c) c = this.anonymousPackage;
            d = a.indexOf(":");
            if (d >= 0) a = a.slice(0, d);
            return this._canonicalPackageId(a, b, c)
        };k.prototype.packageFor = function (a, b) {
            if (!b) b = this.anonymousPackage;
            var c = a.indexOf(":", 2);
            if (c >= 0) a = a.slice(0, c);
            return this._packageFor(a, b)
        };k.prototype.ready = function (a, b) {
            if (!b) b = this.anonymousPackage;
            var c = a.indexOf(":", 2),
                d;
            if (c >= 0) {
                d = a.slice(c + 1);
                a = a.slice(0, c)
            }
            if (this._packageReady(a, b, {})) {
                a = this._packageFor(a, b);
                if (!a) return false;
                return !!a.exists(d)
            } else return false
        };k.prototype.ensurePackage = function (a, b, c, d) {
            if (b && "string" !== typeof b) {
                d =
                c;
                c = b;
                b = null
            }
            if (c && "function" === typeof c) {
                d = c;
                c = null
            }
            if (!c) c = this.anonymousPackage;
            this._ensurePackage(a, b, c, {}, d)
        };k.prototype._ensurePackage = function (a, b, c, d, l) {
            var m = this,
                z;
            z = this._canonicalPackageId(a, b, c);
            if (!z) return l(new u(a, c));
            if (d[z]) return l();
            d[z] = true;
            a = this._sourceForCanonicalPackageId(z, c);
            if (!a) return l(new u(z, c));
            a.ensurePackage(z, function (D) {
                var H, M, O;
                if (D) return l(D);
                H = m.packageFor(z, c);
                if (!H) return l(new u(z, c));
                D = H.get("dependencies");
                if (!D) return l();
                O = [];
                for (M in D) D.hasOwnProperty(M) && O.push({
                    packageId: M,
                    vers: D[M]
                });
                f(O, function (W, V) {
                    m._ensurePackage(W.packageId, W.vers, H, d, V)
                })(l)
            })
        };k.prototype._canonicalPackageId = function (a, b, c) {
            if (a instanceof Q) return a.id;
            if (w(a)) return a;
            if (a === "default" && this.defaultPackage) return this.defaultPackage.id;
            var d = this.canonicalPackageIds,
                l, m, z, D, H;
            if (!c) c = this.anonymousPackage;
            if (!c) throw new Error("working package is required");
            b || (b = c.requiredVersion(a));
            l = c.id;
            if (!d) d = this.canonicalPackageIds = {};
            d[l] || (d[l] = {});
            d = d[l];
            d[a] || (d[a] = {});
            d = d[a];
            if (d[b]) return d[b];
            l = this.sources;
            m = c.canonicalPackageId(a, b);
            H = c;
            if (!m) if (m = c.canonicalPackageId(a, null)) throw new Error(c.get("name") + " contains an incompatible nested package " + a + " (expected: " + b + ")");
            if (!m && l) {
                D = l.length;
                for (z = 0; !m && z < D; z++) {
                    H = l[z];
                    m = H.canonicalPackageId(a, b)
                }
            }
            m && this._cachePackageSource(m, c, H);
            return d[b] = m
        };k.prototype._cachePackageSource = function (a, b, c) {
            var d = this.packageSources;
            b = b.id;
            if (!d) d = this.packageSources = {};
            d[b] || (d[b] = {});
            d = d[b];
            d[a] = c
        };k.prototype._sourceForCanonicalPackageId =

        function (a, b) {
            var c = this.packageSources,
                d = b.id,
                l, m;
            if (!c) c = this.packageSources = {};
            c[d] || (c[d] = {});
            c = c[d];
            if (c[a]) return c[a];
            d = this.sources;
            if (b) if (l = b.packageFor(a)) m = b;
            if (!m && d) {
                b = d.length;
                for (l = 0; !m && l < b; l++) {
                    m = d[l];
                    m.packageFor(a) || (m = null)
                }
            }
            return c[a] = m
        };k.prototype._packageFor = function (a, b) {
            var c, d;
            if (this.defaultPackage && a === this.defaultPackage.id) return this.defaultPackage;
            c = this.packages;
            if (!c) c = this.packages = {};
            if (c[a]) return c[a];
            if (b = this._sourceForCanonicalPackageId(a, b)) d = b.packageFor(a);
            return c[a] = d
        };k.prototype._packageReady = function (a, b, c) {
            var d;
            if (c[a]) return true;
            c[a] = true;
            b = this._packageFor(a, b);
            if (!b) return false;
            a = b.get("dependencies");
            for (d in a) if (a.hasOwnProperty(d)) {
                a = a[d];
                a = this._canonicalPackageId(d, a, b);
                if (!a) return false;
                return this._packageReady(a, b, c)
            }
            return true
        };k.prototype._resolve = function (a, b, c) {
            var d, l, m, z;
            if (a[0] === "/" && a.indexOf(":") < 0) return this.anonymousPackage.id + ":" + a;
            if (a.match(/(^\.\.?\/)|(\/\.\.?\/)|(\/\.\.?\/?$)/)) {
                if ((d = a.indexOf(":")) >= 0) {
                    z = a.slice(0, d);
                    a = a.slice(d + 1);
                    b = []
                } else if (a.match(/^\.\.?\//)) {
                    if (!b) throw new Error("id required to resolve relative id: " + a);
                    if (b.indexOf(":") >= 0) throw new Error("current moduleId cannot contain packageId");
                    if (c) z = c.id;
                    b = b.split("/");
                    b.pop()
                } else b = [];
                m = a.split("/");
                c = m.length;
                for (d = 0; d < c; d++) {
                    l = m[d];
                    if (l === "..") {
                        if (b.length < 1) throw new Error("invalid path: " + a);
                        b.pop()
                    } else l !== "." && b.push(l)
                }
                a = b.join("/");
                if (z) a = e(z, a)
            }
            return a
        };
        var r = x.extend(Object);x.Sandbox = r;r.prototype.init = function (a, b, c, d) {
            this.loader =
            a;
            this.env = b;
            this.args = c;
            d && this.main(d);
            this.clear()
        };r.prototype.catalogPackages = function (a) {
            return this.loader.catalogPackages(a)
        };r.prototype.createRequire = function (a) {
            var b = this,
                c = a.id,
                d = a.ownerPackage,
                l = function (m, z) {
                    if (z && m.indexOf(":") < 0) {
                        if (z.isPackage) z = z.id;
                        m = z + ":" + m
                    }
                    return b.require(m, c, d)
                };
            a = l.displayName = (c || "(unknown)") + "#require";
            l.nativeRequire = b.nativeRequire;
            l.ensure = function (m, z) {
                if (!h(m)) {
                    m = Array.prototype.slice.call(arguments);
                    z = m.pop()
                }
                f(m, function (D, H) {
                    b.ensure(D, c, d, H)
                })(function (D) {
                    if (D) return z(D);
                    if (z.length <= 1) return z();
                    z(null, g(m, function (H) {
                        return b.require(H, c, d)
                    }))
                })
            };
            l.ensure.displayName = a + ".ensure";
            l.ready = function (m) {
                var z, D;
                h(m) || (m = Array.prototype.slice.call(arguments));
                D = m.length;
                for (z = 0; z < D; z++) if (!b.ready(m[z], c, d)) return false;
                return true
            };
            l.ready.displayName = a + ".ready";
            l.packageFor = function (m, z) {
                return b.packageFor(m, z, d)
            };
            l.packageFor.displayName = a + ".packageFor";
            l.ensurePackage = function (m, z, D) {
                b.ensurePackage(m, z, d, function (H) {
                    if (H) return D(H);
                    if (D.length <= 1) return D();
                    D(null, b.packageFor(m, z, d))
                })
            };
            l.ensurePackage.displayName = a + ".ensurePackage.displayName";
            l.catalogPackages = function () {
                return b.catalogPackages(d)
            };
            l.main = b.main();
            l.env = b.env;
            l.args = b.args;
            l.sandbox = b;
            l.loader = b.loader;
            l.isTiki = true;
            return l
        };r.prototype.Module = S;r.prototype.module = function (a, b, c) {
            var d, l, m;
            b = this.loader.canonical(a, b, c);
            if (!b) throw new u(a, c);
            d = this.modules;
            if (!d) d = this.modules = {};
            if (a = d[b]) return a;
            l = b.indexOf(":", 2);
            a = b.slice(l + 1);
            l = b.slice(0, l);
            m = this.loader.packageFor(l, c);
            if (!m) throw new u(l, c);
            return a = d[b] = new this.Module(a, m, this)
        };r.prototype.main = function (a, b) {
            if (a !== undefined) {
                this._mainModule = null;
                this._mainModuleId = a;
                this._mainModuleWorkingPackage = b;
                return this
            } else {
                if (!this._mainModule && this._mainModuleId) {
                    b = this._mainModuleWorkingPackage;
                    this._mainModule = this.module(this._mainModuleId, b)
                }
                return this._mainModule
            }
        };r.prototype.require = function (a, b, c) {
            var d, l;
            b = this.loader.canonical(a, b, c);
            if (!b) throw new u(a, c);
            l = this.exports;
            a = this.usedExports;
            if (!l) l = this.exports = {};
            if (!a) a = this.usedExports = {};
            if (d = l[b]) {
                d = d.exports;
                a[b] || (a[b] = d);
                return d
            }
            d = this.loader.load(b, c, this);
            if (!d) throw new u(b, c);
            c = this.module(b, c);
            l[b] = c;
            l = d.call(this, c);
            c.exports = l;
            if (a[b] && a[b] !== l) throw new Error("cyclical requires() in " + b);
            return l
        };r.prototype.ready = function (a, b, c) {
            return (a = this.loader.canonical(a, b, c)) ? this.loader.ready(a) : false
        };r.prototype.ensure = function (a, b, c, d) {
            var l, m, z;
            if (b && "string" !== typeof b) {
                d = c;
                c = b;
                b = null
            }
            if (c && "function" === typeof c) {
                d = c;
                c = null
            }
            b = this.loader.canonical(a, b, c);
            if (!b) return d(new u(a, c));
            z = b.indexOf(":", 2);
            a = b.slice(z + 1);
            m = b.slice(0, z);
            l = this.loader;
            l.ensurePackage(m, c, function (D) {
                if (D) return d(D);
                D = l.packageFor(m, c);
                D.exists(a) ? d() : d(new u(a, D))
            })
        };r.prototype.packageFor = function (a, b, c) {
            a = this.loader.canonicalPackageId(a, b, c);
            if (!a) return null;
            return this.loader.packageFor(a)
        };r.prototype.ensurePackage = function (a, b, c, d) {
            if (b && "string" !== typeof b) {
                d = c;
                c = b;
                b = null
            }
            if (c && "function" === typeof c) {
                d = c;
                c = null
            }
            b = this.loader.canonicalPackageId(a, b, c);
            if (!b) return d(new u(a, c));
            this.loader.ensurePackage(b, d)
        };r.prototype.resource = function (a, b, c) {
            if (!c.resource) return null;
            return c.resource(a, b)
        };r.prototype.clear = function () {
            this.exports = {};
            this.modules = {};
            this.usedExports = {};
            return this
        };
        var q = x.extend(Object);x.Browser = q;q.prototype.init = function () {
            this._ready = {};
            this._unload = {};
            this.clear()
        };q.prototype.clear = function () {
            this.packageInfoByName = {};
            this.packageInfoById = {};
            this.packages = {};
            this.factories = {};
            this.stylesheetActions = {};
            this.scriptActions = {};
            this.ensureActions = {}
        };q.start = function (a, b, c) {
            var d;
            d = new q;
            d.loader = new k([d]);
            d.sandbox = new r(d.loader, a, b);
            d.queue = c;
            d.require = d.sandbox.createRequire({
                id: "index",
                ownerPackage: d.loader.anonymousPackage
            });
            return d
        };q.prototype.replay = function () {
            var a = this.queue,
                b = a ? a.length : 0,
                c, d;this.queue = null;
            for (c = 0; c < b; c++) {
                d = a[c];
                this[d.m].apply(this, d.a)
            }
            return this
        };q.prototype.start = function () {
            return this
        };q.prototype.global = function (a) {
            if (!P && !X) return this;
            var b = function () {
                return this
            }(),
                c, d, l, m, z, D, H, M;
            c = this.globals;
            if (!c) c = this.globals = {};
            d = this.packageFor(a);
            if (!d) throw new Error(a + " package not found");
            l = d.get("dependencies");
            if (!l) return this;
            for (m in l) if (l.hasOwnProperty(m)) {
                a = this.loader.canonical(m, d);
                if (!c[a]) {
                    c[a] = true;
                    if (this.sandbox.ready(m, d)) {
                        a = this.sandbox.require(m, d);
                        if (z = a.__globals__) {
                            M = z.length;
                            for (H = 0; H < M; H++) {
                                D = z[H];
                                b[D] = a[D]
                            }
                        } else for (D in a) if (a.hasOwnProperty(D)) b[D] = a[D]
                    }
                }
            }
            return this
        };
        var G = function (a) {
            var b, c;
            if (a.length === 1) {
                b = null;
                c = a[0];
                a = Array.prototype.slice.call(a, 1)
            } else {
                b =
                a[0];
                c = a[1];
                a = Array.prototype.slice.call(a, 2)
            }
            return {
                target: b,
                method: c,
                args: a
            }
        },
            K = function (a, b, c) {
                a[b] || (a[b] = []);
                a[b].push(G(c))
            };q.prototype.addReadyListener = function () {
            if (this._ready && this._ready.isReady) this._invoke(G(arguments));
            else {
                this._setupReadyListener();
                K(this._ready, "queue", arguments)
            }
        };q.prototype.addMainListener = function () {
            if (this._ready && this._ready.isReady) this._invoke(G(arguments));
            else {
                this._setupReadyListener();
                K(this._ready, "mqueue", arguments)
            }
        };q.prototype.addUnloadListener =

        function () {
            if (this._unload && this._unload.isUnloading) this._invoke(G(arguments));
            else {
                this._setupUnloadListener();
                K(this._unload, "queue", arguments)
            }
        };q.prototype._invoke = function (a) {
            var b = a.target,
                c = a.method;
            if ("string" === typeof b) b = this.require(b);
            if ("string" === typeof c) c = b[c];
            c && c.apply(b, a.args);
            a.target = a.method = a.args = null
        };q.prototype._setupReadyListener = function () {
            if (this._ready.setup) return this;
            this._ready.setup = true;
            var a = this._ready,
                b = this,
                c;
            c = function () {
                if (!a.isReady) {
                    a.isReady = true;
                    a.cleanup && a.cleanup();
                    a.cleanup = null;
                    var d, l, m;
                    l = (d = a.queue) ? d.length : 0;a.queue = null;
                    for (m = 0; m < l; m++) b._invoke(d[m]);l = (d = a.mqueue) ? d.length : 0;a.mqueue = null;
                    for (m = 0; m < l; m++) b._invoke(d[m]);b._runMain()
                }
            };
            if ("undefined" !== typeof document) if (document.addEventListener) {
                a.cleanup = function () {
                    document.removeEventListener("DOMContentLoaded", c, false);
                    document.removeEventListener("load", c, false)
                };
                document.addEventListener("DOMContentLoaded", c, false);
                document.addEventListener("load", c, false)
            } else if (document.attachEvent) {
                a.cleanup =

                function () {
                    document.detachEvent("onreadystatechange", c);
                    document.detachEvent("onload", c);
                    a.ieHandler = null
                };
                document.attachEvent("onreadystatechange", c);
                document.attachEvent("onload", c);
                if (document.documentElement.doScroll && window == window.top) {
                    a.ieHandler = function () {
                        if (a.ieHandler && !a.isReady) try {
                            document.documentElement.doScroll("left")
                        } catch (d) {
                            setTimeout(a.ieHandler, 0);
                            return
                        }
                        c()
                    };
                    a.ieHandler()
                }
            }
        };q._scheduleUnloadListener = function () {
            if (this._unload.setup) return this;
            this._unload.setup = true;
            var a =
            this._unload,
                b = this,
                c;
            a.isUnloading = false;
            c = function () {
                if (!a.isUnloading) {
                    a.isUnloading = true;
                    a.cleanup && a.cleanup();
                    a.cleanup = null;
                    var d = a.queue,
                        l = d ? d.length : 0,
                        m;a.queue = null;
                    for (m = 0; m < l; m++) b._invoke(d[m])
                }
            };
            if ("undefined" !== typeof document) if (document.addEventListener) {
                a.cleanup = function () {
                    document.removeEventListener("unload", c)
                };
                document.addEventListener("unload", c, false)
            } else if (document.attachEvent) {
                a.cleanup = function () {
                    document.detachEvent("onunload", c)
                };
                document.attachEvent("unload", c)
            }
        };
        q.prototype.main = function (a, b) {
            this.sandbox && this.sandbox.main(a);
            this._setupReadyListener();
            this._main = {
                id: a,
                method: b
            }
        };q.prototype._runMain = function () {
            if (this._main) {
                var a = this._main.id,
                    b = this._main.method,
                    c = this.require;
                if (a && c) {
                    this._main = null;
                    c.ensure(a, function (d) {
                        if (d) throw d;
                        d = c(a);
                        if ("string" === typeof b) b = d[b];
                        b && b.call(d)
                    })
                }
            }
        };q.prototype._action = function (a) {
            var b;
            return b = n(function (c) {
                b.resolve = function (d, l) {
                    b.resolve = null;
                    c(d, l)
                };
                a()
            })
        };q.prototype._resolve = function (a, b, c) {
            if (a[b]) a[b].resolve && a[b].resolve(null, c);
            else a[b] = function (d) {
                d(null, c)
            };
            return this
        };q.prototype._fail = function (a, b, c) {
            a[b].resolve && a[b].resolve(c)
        };q.prototype._normalize = function (a, b) {
            w(b) || (b = "::" + b);
            a.id = b;
            a.version = J.normalize(a.version);
            a["tiki:external"] = !! a["tiki:external"];
            a["tiki:private"] = !! a["tiki:private"];
            var c = a["tiki:base"];
            if (a["tiki:resources"]) a["tiki:resources"] = g(a["tiki:resources"], function (m) {
                if ("string" === typeof m) m = {
                    id: b + ":" + m,
                    name: m
                };
                if (!m.name) throw new A(a, "resources must have a name");
                if (!m.id) m.id = b + ":" + m.name;
                if (!w(m.id)) m.id = "::" + m.id;
                if (!m.type) m.type = m.name.match(/\.js$/) ? "script" : m.name.match(/\.css$/) ? "stylesheet" : "resource";
                if (!m.url) m.url = c ? c + "/" + m.name : m.id + m.name;
                return m
            });
            if (!a.dependencies) a.dependencies = {};
            var d = a["tiki:nested"],
                l;
            if (d) for (l in d) {
                if (d.hasOwnProperty(l)) w(d[l]) || (d[l] = "::" + d[l])
            } else a["tiki:nested"] = {};
            return a
        };q.prototype.register = function (a, b) {
            var c, d, l, m = -1;
            b = this._normalize(b, a);
            a = b.id;
            c = this.packageInfoById;
            if (!c) c = this.packageInfoById = {};
            if (c[a]) {
                if (!c[a]["tiki:external"]) return this;
                d = c[a]
            }
            c[a] = b;
            if (b.name) {
                a = b.name;
                l = b.version;
                c = this.packageInfoByName;
                if (!c) c = this.packageInfoByName = {};
                c[a] || (c[a] = {});
                c = c[a];
                if (!c[l] || c[l].length <= 1) c[l] = [b];
                else {
                    if (d) m = c[l].indexOf(d);
                    if (m >= 0) c[l] = c[l].slice(0, m).concat(c[l].slice(m + 1));
                    c[l].push(b)
                }
            }
            return this
        };q.prototype.module = function (a, b) {
            w(a) || (a = "::" + a);
            this.factories[a] = b;
            return this
        };q.prototype.script = function (a) {
            w(a) || (a = "::" + a);
            this._resolve(this.scriptActions, a, true)
        };q.prototype.stylesheet =

        function (a) {
            w(a) || (a = "::" + a);
            this._resolve(this.stylesheetActions, a, true)
        };
        var P = "undefined" !== typeof document && document.createElement,
            X = "undefined" !== typeof XMLHttpRequest;q.prototype.xhr = !P;q.prototype.autowrap = false;
        var Z = function (a) {
            if (!a) return null;
            for (var b = a.length; --b >= 0;) if (!a[b]["tiki:private"]) return a[b];
            return null
        };q.prototype.canonicalPackageId = function (a, b) {
            a = this.packageInfoByName[a];
            var c, d, l;
            if (b) b = J.normalize(b);
            if (!a) return null;
            if (a[b] && a[b].length === 1) return a[b][0].id;
            for (d in a) if (a.hasOwnProperty(d)) if (J.compatible(b, d)) if (!c || J.compare(l, d) < 0) if (c = Z(a[d])) l = d;
            return c ? c.id : null
        };q.prototype.packageFor = function (a) {
            var b = this.packages[a];
            if (b) return b;
            if ((b = this.packageInfoById[a]) && !b["tiki:external"]) {
                b = new this.Package(a, b, this);
                return this.packages[a] = b
            }
            return null
        };q.prototype.ensurePackage = function (a, b) {
            var c = this.ensureActions[a];
            if (c) return c(b);
            var d = this.packageInfoById[a];
            if (!d) return b(new u(a, "browser package info"));
            var l = this;
            c = n(function (m) {
                var z = 1,
                    D = false,
                    H, M = function (Y) {
                        if (!H) {
                            if (Y) {
                                H = true;
                                return m(Y)
                            }
                            z -= 1;
                            if (z <= 0 && D) return m(null, d)
                        }
                    },
                    O = d.dependencies,
                    W = d["tiki:nested"],
                    V, T;
                for (V in O) if (O.hasOwnProperty(V)) {
                    T = W[V];
                    if (!T) {
                        T = O[V];
                        T = l.canonicalPackageId(V, T)
                    }
                    if (T && l.packageInfoById[a]) {
                        z++;
                        l.ensurePackage(T, M)
                    }
                }
                W = (O = d["tiki:resources"]) ? O.length : 0;
                for (V = 0; V < W; V++) {
                    T = O[V];
                    if (T.type !== "resource") if (T.type === "script") {
                        z++;
                        l.ensureScript(T.id, T.url, M)
                    } else if (T.type === "stylesheet") {
                        z++;
                        l.ensureStylesheet(T.id, T.url, M)
                    }
                }
                D = true;M()
            });
            this.ensureActions[a] = c;
            c(b)
        };q.prototype.ensureScript = function (a, b, c) {
            var d =
            this.scriptActions[a];
            if (d) return d(c);
            var l = this;
            d = this._action(function () {
                l._loadScript(a, b)
            });
            this.scriptActions[a] = d;
            return d(c)
        };q.prototype.ensureStylesheet = function (a, b, c) {
            var d = this.stylesheetActions[a];
            if (d) return d(c);
            var l = this;
            d = this._action(function () {
                l._loadStylesheet(a, b)
            });
            this.stylesheetActions[a] = d;
            return d(c)
        };q.prototype._injectScript = function (a, b) {
            var c;
            a = document.body;
            c = document.createElement("script");
            c.src = b;
            a.appendChild(c)
        };q.prototype._xhrScript = function (a, b) {
            var c = this.autowrap,
                d = new XMLHttpRequest;
            d.open("GET", b, true);
            d.onreadystatechange = function () {
                if (!(d.readyState !== 4 || d.status !== 200 && d.status !== 0)) {
                    var l = d.responseText;
                    if (c) l = "tiki.module('" + a + "', function(require, exports, module) {" + l + "});tiki.script('" + a + "');";
                    eval(l + "\n//@ sourceURL=" + b)
                }
            };
            d.send(null)
        };q.prototype._loadScript = function (a, b) {
            if (this.autowrap) {
                this.xhr = true;
                X || t("Autowrap is on but XHR is not available. Danger ahead.")
            }
            if (X && P) if (this.xhr) try {
                return this._xhrScript(a, b)
            } catch (c) {
                return this._injectScript(a, b)
            } else try {
                return this._injectScript(a, b)
            } catch (d) {
                return this._xhrScript(a, b)
            } else if (X) return this._xhrScript(a, b);
            else if (P) return this._injectScript(a, b);
            t("Browser#_loadScript() not supported on this platform.");
            this.script(a)
        };q.prototype._loadStylesheet = P ?
        function (a, b) {
            var c, d;
            c = document.getElementsByTagName("head")[0] || document.body;
            d = document.createElement("link");
            d.rel = "stylesheet";
            d.href = b;
            d.type = "text/css";
            c.appendChild(d);
            this.stylesheet(a)
        } : function (a) {
            t("Browser#_loadStylesheet() not supported on this platform.");
            this.stylesheet(a)
        };S = Q.extend();q.prototype.Package = S;S.prototype.init = function (a, b, c) {
            Q.prototype.init.call(this, a, b);
            this.source = c
        };S.prototype.canonicalPackageId = function (a, b) {
            var c;
            if (c = Q.prototype.canonicalPackageId.call(this, a, b)) return c;
            c = (this.get("tiki:nested") || {})[a];
            if (!c) return null;
            return (a = this.source.packageInfoById[c]) && J.compatible(b, a.version) ? c : null
        };S.prototype.packageFor = function (a) {
            var b = Q.prototype.packageFor.call(this, a);
            return b ? b : this.source.packageFor(a)
        };S.prototype.ensurePackage =

        function (a, b) {
            if (a === this.id) return b();
            this.source.ensurePackage(a, b)
        };S.prototype.catalogPackages = function () {
            var a = [this],
                b, c;
            b = this.get("tiki:nested") || {};
            for (c in b) b.hasOwnProperty(c) && a.push(this.source.packageFor(b[c]));
            return a
        };S.prototype.exists = function (a) {
            return !!this.source.factories[this.id + ":" + a]
        };S.prototype.load = function (a) {
            var b;
            return (b = this.source.factories[this.id + ":" + a]) ? new this.Factory(a, this, b) : null
        };S.prototype.Factory = U;p(x, "tiki")
    });
    y = y.start();
    y.replay();
    bespin.tiki = y
})();
bespin.tiki.register("::bespin", {
    name: "bespin",
    dependencies: {}
});
bespin.bootLoaded = true;
bespin.tiki.module("bespin:builtins", function (y, j) {
    j.metadata = {
        bespin: {
            provides: [{
                ep: "extensionpoint",
                name: "extensionpoint",
                indexOx: "name",
                register: "plugins#registerExtensionPoint",
                unregister: "plugins#unregisterExtensionPoint",
                description: "Defines a new extension point",
                params: [{
                    name: "name",
                    type: "string",
                    description: "the extension point's name",
                    required: true
                },
                {
                    name: "description",
                    type: "string",
                    description: "description of what the extension point is for"
                },
                {
                    name: "params",
                    type: "array of objects",
                    description: "parameters that provide the metadata for a given extension. Each object should have name and description, minimally. It can also have a 'type' (eg string, pointer, or array) and required to denote whether or not this parameter must be present on the extension."
                },
                {
                    name: "indexOn",
                    type: "string",
                    description: "You can provide an 'indexOn' property to name a property of extensions through which you'd like to be able to easily look up the extension."
                },
                {
                    name: "register",
                    type: "pointer",
                    description: "function that is called when a new extension is discovered. Note that this should be used sparingly, because it will cause your plugin to be loaded whenever a matching plugin appears."
                },
                {
                    name: "unregister",
                    type: "pointer",
                    description: "function that is called when an extension is removed. Note that this should be used sparingly, because it will cause your plugin to be loaded whenever a matching plugin appears."
                }]
            },
            {
                ep: "extensionpoint",
                name: "extensionhandler",
                register: "plugins#registerExtensionHandler",
                unregister: "plugins#unregisterExtensionHandler",
                description: "Used to attach listeners ",
                params: [{
                    name: "name",
                    type: "string",
                    description: "name of the extension point to listen to",
                    required: true
                },
                {
                    name: "register",
                    type: "pointer",
                    description: "function that is called when a new extension is discovered. Note that this should be used sparingly, because it will cause your plugin to be loaded whenever a matching plugin appears."
                },
                {
                    name: "unregister",
                    type: "pointer",
                    description: "function that is called when an extension is removed. Note that this should be used sparingly, because it will cause your plugin to be loaded whenever a matching plugin appears."
                }]
            },
            {
                ep: "extensionpoint",
                name: "factory",
                description: "Provides a factory for singleton components. Each extension needs to provide a name, a pointer and an action. The action can be 'call' (if the pointer refers to a function), 'new' (if the pointer refers to a traditional JS object) or 'value' (if the pointer refers to the object itself that is the component).",
                indexOn: "name"
            },
            {
                ep: "factory",
                name: "hub",
                action: "create",
                pointer: "util/hub#Hub"
            },
            {
                ep: "extensionpoint",
                name: "command",
                description: "Editor commands/actions. TODO: list parameters here."
            }]
        }
    }
});
bespin.tiki.module("bespin:console", function (y, j) {
    y = y("util/util");
    var x = function () {},
        E = ["assert", "count", "debug", "dir", "dirxml", "error", "group", "groupEnd", "info", "log", "profile", "profileEnd", "time", "timeEnd", "trace", "warn"];
    if (typeof window === "undefined") {
        var w = {};
        E.forEach(function (t) {
            w[t] = function () {
                var h = Array.prototype.slice.call(arguments);
                postMessage(JSON.stringify({
                    op: "log",
                    method: t,
                    args: h
                }))
            }
        });
        j.console = w
    } else if (y.isSafari || y.isChrome) j.console = window.console;
    else {
        j.console = {};
        E.forEach(function (t) {
            j.console[t] =
            window.console && window.console[t] ? window.console[t] : x
        })
    }
});
bespin.tiki.module("bespin:globals", function () {
    if (!Object.defineProperty) Object.defineProperty = function (y, j, x) {
        var E = Object.prototype.hasOwnProperty;
        if (typeof x == "object" && y.__defineGetter__) {
            if (E.call(x, "value")) {
                if (!y.__lookupGetter__(j) && !y.__lookupSetter__(j)) y[j] = x.value;
                if (E.call(x, "get") || E.call(x, "set")) throw new TypeError("Object doesn't support this action");
            } else typeof x.get == "function" && y.__defineGetter__(j, x.get);
            typeof x.set == "function" && y.__defineSetter__(j, x.set)
        }
        return y
    };
    if (!Object.defineProperties) Object.defineProperties = function (y, j) {
        for (var x in j) Object.prototype.hasOwnProperty.call(j, x) && Object.defineProperty(y, x, j[x]);
        return y
    };
    (function () {
        if (!Array.isArray) Array.isArray = function (y) {
            return y && Object.prototype.toString.call(y) == "[object Array]"
        };
        if (!Object.keys) Object.keys = function (y) {
            var j, x = [];
            for (j in y) y.hasOwnProperty(j) && x.push(j);
            return x
        };
        if (!Function.prototype.bind) Function.prototype.bind = function () {
            var y = Array.prototype.slice.call(arguments),
                j = this,
                x = function () {
                    return j.call.apply(j, y.concat(Array.prototype.slice.call(arguments)))
                };
            x.name = this.name;
            x.displayName = this.displayName;
            x.length = this.length;
            x.unbound = j;
            return x
        }
    })()
});
bespin.tiki.module("bespin:index", function (y, j) {
    j.versionNumber = "0.9a1";
    j.versionCodename = "Edison";
    j.apiVersion = "4"
});
bespin.tiki.module("bespin:plugins", function (y, j) {
    y("globals");
    var x = y("promise").Promise,
        E = y("promise").group,
        w = y("builtins"),
        t = y("console").console,
        h = y("util/util");
    y("util/stacktrace");
    var o = y("proxy"),
        s = y.loader.sources[0],
        C = function (f, g) {
            if (g) {
                g = g.split("#");
                return {
                    modName: g[0] ? f + ":" + g[0] : f,
                    objName: g[1]
                }
            }
        },
        v = function (f) {
            var g = y(f.modName);
            if (f.objName) return g[f.objName];
            return g
        };
    j.Extension = function (f) {
        this.pluginName = null;
        for (property in f) if (f.hasOwnProperty(property)) this[property] = f[property];
        this._observers = []
    };
    j.Extension.prototype = {
        load: function (f, g, n) {
            n = n || j.catalog;
            var p = new x,
                u = function (I) {
                    f && f(I);
                    p.resolve(I)
                };
            g = this[g || "pointer"];
            if (h.isFunction(g)) {
                u(g);
                return p
            }
            var A = C(this.pluginName, g);
            if (!A) {
                t.error("Extension cannot be loaded because it has no 'pointer'");
                t.log(this);
                p.reject(new Error("Extension has no 'pointer' to call"));
                return p
            }
            var L = this.pluginName;
            n.loadPlugin(L).then(function () {
                y.ensure(A.modName, function () {
                    var I = v(A);
                    u(I)
                })
            }, function (I) {
                t.error("Failed to load plugin ", L, I)
            });
            return p
        },
        observe: function (f, g, n) {
            this._observers.push({
                plugin: f,
                callback: g,
                property: n
            });
            this.load(g, n)
        },
        getPluginName: function () {
            return this.pluginName
        },
        _getLoaded: function (f) {
            f = this._getPointer(f);
            return v(f)
        }
    };
    j.ExtensionPoint = function (f, g) {
        this.name = f;
        this.catalog = g;
        this.indexOn = this.pluginName = undefined;
        this.extensions = [];
        this.handlers = []
    };
    j.ExtensionPoint.prototype = {
        getImplementingPlugins: function () {
            var f = {};
            this.extensions.forEach(function (n) {
                f[n.pluginName] = true
            });
            var g = Object.keys(f);
            g.sort();
            return g
        },
        getDefiningPluginName: function () {
            return this.pluginName
        },
        getByKey: function (f) {
            var g = this.indexOn;
            if (g) for (var n = 0; n < this.extensions.length; n++) if (this.extensions[n][g] == f) return this.extensions[n]
        },
        register: function (f) {
            var g = this.catalog;
            this.extensions.push(f);
            this.handlers.forEach(function (n) {
                n.register && n.load(function (p) {
                    p ? p(f, g) : t.error("missing register function for pluginName=", f.pluginName, ", extension=", f.name)
                }, "register", g)
            })
        },
        unregister: function (f) {
            var g = this.catalog;
            this.extensions.splice(this.extensions.indexOf(f), 1);
            this.handlers.forEach(function (n) {
                n.unregister && n.load(function (p) {
                    p ? p(f, g) : t.error("missing unregister function for pluginName=", f.pluginName, ", extension=", f.name)
                }, "unregister", g)
            })
        },
        orderExtensions: function (f) {
            for (var g = [], n = 0; n < f.length; n++) for (var p = 0; p != this.extensions.length;) if (this.extensions[p].pluginName === f[n]) {
                g.push(this.extensions[p]);
                this.extensions.splice(p, 1)
            } else p++;
            this.extensions = g.concat(this.extensions)
        }
    };
    j.Plugin = function (f) {
        this.name =
        this.catalog = null;
        this.provides = [];
        this.stylesheets = [];
        this.reloadPointer = this.reloadURL = null;
        for (property in f) if (f.hasOwnProperty(property)) this[property] = f[property]
    };
    j.Plugin.prototype = {
        register: function () {
            this.provides.forEach(function (f) {
                this.catalog.getExtensionPoint(f.ep, true).register(f)
            }, this)
        },
        unregister: function () {
            this.provides.forEach(function (f) {
                this.catalog.getExtensionPoint(f.ep, true).unregister(f)
            }, this)
        },
        _getObservers: function () {
            var f = {};
            this.provides.forEach(function (g) {
                t.log("ep: ", g.ep);
                t.log(g._observers);
                f[g.ep] = g._observers
            });
            return f
        },
        _findDependents: function (f, g, n) {
            var p = this.name,
                u = this;
            f.forEach(function (A) {
                if (A != p) {
                    var L = u.catalog.plugins[A];
                    if (L && L.dependencies) for (dependName in L.dependencies) if (dependName == p && !g[A]) {
                        g[A] = {
                            keepModule: false
                        };
                        n || L._findDependents(f, g)
                    }
                }
            })
        },
        _cleanup: function (f) {
            this.stylesheets.forEach(function (L) {
                for (var I = document.getElementsByTagName("link"), N = 0; N < I.length; N++) if (I[N].href.indexOf(L.url) != -1) {
                    I[N].parentNode.removeChild(I[N]);
                    break
                }
            });
            var g = this.name,
                n = new RegExp("^" + g + "$"),
                p = new RegExp("^::" + g + ":");
            g = new RegExp("^::" + g + "$");
            var u = y.sandbox,
                A = y.loader;
            if (!f) {
                F(p, A.factories);
                F(g, A.canonicalIds);
                F(g, A.canonicalPackageIds);
                F(g, A.packageSources);
                F(g, A.packages);
                F(n, s.packageInfoByName);
                F(p, s.factories);
                F(p, s.scriptActions);
                F(p, s.stylesheetActions);
                F(g, s.packages);
                F(g, s.ensureActions);
                F(g, s.packageInfoById)
            }
            F(p, u.exports);
            F(p, u.modules);
            F(p, u.usedExports)
        },
        reload: function (f) {
            if (this.reloadURL) {
                if (this.reloadPointer) {
                    var g = C(this.name, this.reloadPointer);
                    if (func = v(g)) func();
                    else {
                        t.error("Reload function could not be loaded. Aborting reload.");
                        return
                    }
                }
                var n = {};
                this._findDependents(Object.keys(this.catalog.plugins), n);
                var p = {
                    pluginName: this.name,
                    dependents: n
                };
                for (var u in n) {
                    g = this.catalog.plugins[u];
                    if (g.preRefresh) {
                        g = C(u, g.preRefresh);
                        if (func = v(g)) n[u] = func(p)
                    }
                }
                this.unregister();
                for (u in n) this.catalog.plugins[u].unregister();
                this._cleanup(this.name);
                g = [];
                var A = y.sandbox,
                    L = Object.keys(A.modules),
                    I = L.length,
                    N = [];
                for (u in n) n[u].keepModule || N.push(new RegExp("^::" + u + ":"));
                for (var i = new RegExp("^::" + this.name + ":"); --I >= 0;) {
                    var J = L[I];
                    if (i.exec(J)) g.push(J);
                    else for (var U = N.length; --U >= 0;) if (N[U].exec(J)) {
                        g.push(J);
                        break
                    }
                }
                g.forEach(function (R) {
                    delete A.exports[R];
                    delete A.modules[R];
                    delete A.usedExports[R]
                });
                g = function () {
                    this.catalog.loadPlugin(this.name).then(function () {
                        for (u in n) this.catalog.plugins[u].register();
                        for (u in n) if (n[u].callPointer) {
                            var R = C(u, n[u].callPointer);
                            (R = v(R)) && R(p)
                        }
                        f && f()
                    }.bind(this))
                }.bind(this);
                L = function () {
                    t.error("Failed to load metadata from " + this.reloadURL)
                }.bind(this);
                this.catalog.loadMetadataFromURL(this.reloadURL).then(g, L)
            }
        }
    };
    var B = function (f, g, n) {
        g = g.split(".");
        f = f;
        var p = g.length - 1;
        if (p > 0) for (var u = 0; u < p; u++) f = f[g[u]];
        f[p] = n
    };
    j.Catalog = function () {
        this.points = {};
        this.plugins = {};
        this.metadata = {};
        this.USER_DEACTIVATED = "USER";
        this.DEPENDS_DEACTIVATED = "DEPENDS";
        this.deactivatedPlugins = {};
        this._extensionsOrdering = [];
        this.instances = {};
        this.instancesLoadPromises = {};
        this._objectDescriptors = {};
        this.children = [];
        this.getExtensionPoint("extensionpoint", true).indexOn = "name";
        this.registerMetadata(w.metadata)
    };
    j.Catalog.prototype = {
        shareExtension: function (f) {
            return this.plugins[f.pluginName].share
        },
        isPluginLoaded: function (f) {
            return Object.keys(y.sandbox.usedExports).some(function (g) {
                return g.indexOf("::" + f + ":") == 0
            })
        },
        registerObject: function (f, g) {
            this._objectDescriptors[f] = g
        },
        _setObject: function (f, g) {
            this.instances[f] = g
        },
        createObject: function (f) {
            if (this.instancesLoadPromises[f] !== undefined) return this.instancesLoadPromises[f];
            var g = this._objectDescriptors[f];
            if (g === undefined) throw new Error('Tried to create object "' + f + '" but that object is not registered.');
            var n = g.factory || f,
                p = this.getExtensionByKey("factory", n);
            if (p === undefined) throw new Error('When creating object "' + f + '", there is no factory called "' + n + '" available."');
            if (this.parent && this.shareExtension(p)) return this.instancesLoadPromises[f] = this.parent.createObject(f);
            var u = this.instancesLoadPromises[f] = new x,
                A = g.arguments || [];
            n = [];
            if (g.objects) {
                g = g.objects;
                for (var L in g) {
                    var I = this.createObject(g[L]);
                    n.push(I);
                    I.location = L;
                    I.then(function (N) {
                        B(A, I.location, N)
                    })
                }
            }
            E(n).then(function () {
                p.load().then(function (N) {
                    var i = p.action;
                    if (i === "call") N = N.apply(N, A);
                    else if (i === "new") {
                        if (A.length > 1) {
                            u.reject(new Error("For object " + f + ", create a simple factory function and change the action to call because JS cannot handle this case."));
                            return
                        }
                        N = new N(A[0])
                    } else if (i === "value") N = N;
                    else {
                        u.reject(new Error("Create action must be call|new|value. Found" + i));
                        return
                    }
                    this.instances[f] = N;
                    u.resolve(N)
                }.bind(this))
            }.bind(this));
            return u
        },
        getObject: function (f) {
            return this.instances[f] || (this.parent ? this.parent.getObject(f) : undefined)
        },
        getExtensionPoint: function (f, g) {
            if (g && this.points[f] === undefined) this.points[f] = new j.ExtensionPoint(f, this);
            return this.points[f]
        },
        getExtensions: function (f) {
            f = this.getExtensionPoint(f);
            if (f === undefined) return [];
            return f.extensions
        },
        orderExtensions: function (f) {
            f = f || this._extensionsOrdering;
            for (name in this.points) this.points[name].orderExtensions(f);
            this._extensionsOrdering = f
        },
        getExtensionsOrdering: function () {
            return this._extensionsOrdering
        },
        getExtensionByKey: function (f, g) {
            f = this.getExtensionPoint(f);
            if (f !== undefined) return f.getByKey(g)
        },
        _toposort: function (f) {
            var g = [],
                n = {},
                p = function (A) {
                    if (!(A in n || !(A in f))) {
                        n[A] = true;
                        var L = f[A].dependencies;
                        if (!h.none(L)) for (var I in L) p(I);
                        g.push(A)
                    }
                };
            for (var u in f) p(u);
            return g
        },
        registerMetadata: function (f) {
            if (this.parent) this.parent.registerMetadata(f);
            else {
                for (var g in f) {
                    var n = f[g];
                    if (n.errors) {
                        t.error("Plugin ", g, " has errors:");
                        n.errors.forEach(function (p) {
                            t.error(p)
                        });
                        delete f[g]
                    } else {
                        if (n.dependencies) n.depends = Object.keys(n.dependencies);
                        n.name = g;
                        n.version = null;
                        s.canonicalPackageId(g) === null && s.register("::" + g, n)
                    }
                }
                h.mixin(this.metadata, h.clone(f, true));
                this.children.forEach(function (p) {
                    p._registerMetadata(h.clone(f, true))
                });
                this._registerMetadata(h.clone(f, true))
            }
        },
        _registerMetadata: function (f) {
            var g, n = this.plugins;
            this._toposort(f).forEach(function (p) {
                if (this.plugins[p]) if (this.isPluginLoaded(p)) return;
                else {
                    var u = this.plugins[p];
                    u.unregister()
                }
                var A = f[p],
                    L = !this.deactivatedPlugins[p];
                if (L && A.depends && A.depends.length != 0) if (!A.depends.some(function (i) {
                    return !this.deactivatedPlugins[i]
                }, this)) {
                    this.deactivatedPlugins[p] = "DEPENDS";
                    L = false
                }
                A.catalog = this;
                A.name = p;
                u = new j.Plugin(A);
                n[p] = u;
                if (A.provides) {
                    u = A.provides;
                    for (A = 0; A < u.length; A++) {
                        var I = new j.Extension(u[A]);
                        I.pluginName = p;
                        u[A] = I;
                        var N = I.ep;
                        if (N == "extensionpoint" && I.name == "extensionpoint") j.registerExtensionPoint(I, this, false);
                        else if (L) this.getExtensionPoint(I.ep, true).register(I);
                        else N == "extensionpoint" && j.registerExtensionPoint(I, this, true)
                    }
                } else A.provides = []
            }, this);
            for (g in f) this._checkLoops(g, n, []);
            this.orderExtensions()
        },
        loadPlugin: function (f) {
            var g = new x,
                n = this.plugins[f];
            if (n.objects) {
                var p = [];
                n.objects.forEach(function (u) {
                    p.push(this.createObject(u))
                }.bind(this));
                E(p).then(function () {
                    y.ensurePackage(f, function () {
                        g.resolve()
                    })
                })
            } else y.ensurePackage(f, function (u) {
                u ? g.reject(u) : g.resolve()
            });
            return g
        },
        loadMetadataFromURL: function (f) {
            var g = new x;
            o.xhr("GET", f, true).then(function (n) {
                this.registerMetadata(JSON.parse(n));
                g.resolve()
            }.bind(this), function (n) {
                g.reject(n)
            });
            return g
        },
        deactivatePlugin: function (f, g) {
            var n = this.plugins[f];
            if (!n) {
                g || (this.deactivatedPlugins[f] = "USER");
                return 'There is no plugin named "' + f + '" in this catalog.'
            }
            if (this.deactivatedPlugins[f]) {
                g || (this.deactivatedPlugins[f] = "USER");
                return 'The plugin "' + f + '" is already deactivated'
            }
            this.deactivatedPlugins[f] = g ? "DEPENDS" : "USER";
            var p = {},
                u = [];n._findDependents(Object.keys(this.plugins), p, true);Object.keys(p).forEach(function (A) {
                A = this.deactivatePlugin(A, true);
                if (Array.isArray(A)) u = u.concat(A)
            }, this);n.unregister();g && u.push(f);
            return u
        },
        activatePlugin: function (f, g) {
            var n = this.plugins[f];
            if (!n) return 'There is no plugin named "' + f + '" in this catalog.';
            if (!this.deactivatedPlugins[f]) return 'The plugin "' + f + '" is already activated';
            if (!(g && this.deactivatedPlugins[f] === "USER")) {
                if (n.depends && n.depends.length != 0) if (!n.depends.some(function (A) {
                    return !this.deactivatedPlugins[A]
                }, this)) {
                    this.deactivatedPlugins[f] = "DEPENDS";
                    return 'Can not activate plugin "' + f + '" as some of its dependent plugins are not activated'
                }
                n.register();
                this.orderExtensions();
                delete this.deactivatedPlugins[f];
                var p = [],
                    u = {};
                n._findDependents(Object.keys(this.plugins), u, true);
                Object.keys(u).forEach(function (A) {
                    A = this.activatePlugin(A, true);
                    if (Array.isArray(A)) p = p.concat(A)
                }, this);
                g && p.push(f);
                return p
            }
        },
        removePlugin: function (f) {
            var g = this.plugins[f];
            if (g == undefined) throw new Error("Attempted to remove plugin " + f + " which does not exist.");
            g.unregister();
            g._cleanup(true);
            delete this.metadata[f];
            delete this.plugins[f]
        },
        getResourceURL: function (f) {
            var g =
            document.getElementById("bespin_base"),
                n = "";
            if (g) {
                n += g.href;
                h.endsWith(n, "/") || (n += "/")
            }
            f = this.plugins[f];
            if (f != undefined) return n + f.resourceURL
        },
        _checkLoops: function (f, g, n) {
            var p = false;
            n.forEach(function (L) {
                if (f === L) {
                    t.error("Circular dependency", f, n);
                    p = true
                }
            });
            if (p) return true;
            n.push(f);
            if (g[f]) {
                if (g[f].dependencies) for (var u in g[f].dependencies) {
                    var A = n.slice();
                    if (this._checkLoops(u, g, A)) {
                        t.error("Errors found when looking at ", f);
                        return true
                    }
                }
            } else t.error("Missing metadata for ", f);
            return false
        },
        getPlugins: function (f) {
            var g = [],
                n = f.onlyType;
            for (var p in this.plugins) {
                var u = this.plugins[p];
                n && u.type && u.type != n || u.name == "bespin" || g.push(u)
            }
            var A = f.sortBy;
            A || (A = ["name"]);
            g.sort(function (L, I) {
                for (var N = 0; N < A.length; N++) {
                    p = A[N];
                    if (L[p] < I[p]) return -1;
                    else if (I[p] < L[p]) return 1
                }
                return 0
            });
            return g
        },
        loadObjectForPropertyPath: function (f, g) {
            var n = new x,
                p = /^([^:]+):([^#]+)#(.*)$/.exec(f);
            if (p === null) throw new Error("loadObjectForPropertyPath: malformed path: '" + f + "'");
            p = p[1];
            if (p === "") {
                if (h.none(g)) throw new Error("loadObjectForPropertyPath: no plugin name supplied and no context is present");
                p = g
            }
            y.ensurePackage(p, function () {
                n.resolve(this.objectForPropertyPath(f))
            }.bind(this));
            return n
        },
        objectForPropertyPath: function (f, g, n) {
            n = n == undefined ? f.length : n;g || (g = window);
            var p = f.split("#");
            if (p.length !== 1) {
                g = y(p[0]);
                if (g === undefined) return;
                f = p[1];
                g = g;
                n -= p[0].length
            }
            for (var u = 0; g && u < n;) {
                p = f.indexOf(".", u);
                if (p < 0 || p > n) p = n;
                u = f.slice(u, p);
                g = g[u];
                u = p + 1
            }
            if (u < n) g = undefined;
            return g
        },
        publish: function (f, g, n, p) {
            if (this.shareExtension(this.getExtensionPoint(g))) if (this.parent) this.parent.publish(f, g, n, p);
            else {
                this.children.forEach(function (u) {
                    u._publish(f, g, n, p)
                });
                this._publish(f, g, n, p)
            } else this._publish(f, g, n, p)
        },
        _publish: function (f, g, n, p) {
            this.getExtensions(g).forEach(function (u) {
                if (u.match && !u.regexp) u.regexp = new RegExp(u.match);
                if (u.regexp && u.regexp.test(n) || u.key === n || h.none(u.key) && h.none(n)) u.load().then(function (A) {
                    A(f, n, p)
                })
            })
        },
        registerExtension: function (f, g) {
            g = new j.Extension(g);
            g.pluginName = "__dynamic";
            this.getExtensionPoint(f).register(g)
        }
    };
    j.registerExtensionPoint = function (f, g, n) {
        var p =
        g.getExtensionPoint(f.name, true);
        p.description = f.description;
        p.pluginName = f.pluginName;
        p.params = f.params;
        if (f.indexOn) p.indexOn = f.indexOn;
        if (!n && (f.register || f.unregister)) j.registerExtensionHandler(f, g)
    };
    j.registerExtensionHandler = function (f, g) {
        if (!(g.parent && g.shareExtension(f))) {
            var n = g.getExtensionPoint(f.name, true);
            n.handlers.push(f);
            if (f.register) {
                var p = h.clone(n.extensions);
                f.load(function (u) {
                    if (!u) throw f.name + " is not ready";
                    p.forEach(function (A) {
                        u(A, g)
                    })
                }, "register", g)
            }
        }
    };
    j.unregisterExtensionPoint =

    function (f) {
        if (f.register || f.unregister) j.unregisterExtensionHandler(f)
    };
    j.unregisterExtensionHandler = function (f, g) {
        if (!(g.parent && g.shareExtension(f))) {
            g = g.getExtensionPoint(f.name, true);
            if (g.handlers.indexOf(f) != -1) {
                g.handlers.splice(g.handlers.indexOf(f), 1);
                if (f.unregister) {
                    var n = h.clone(g.extensions);
                    f.load(function (p) {
                        if (!p) throw f.name + " is not ready";
                        n.forEach(function (u) {
                            p(u)
                        })
                    }, "unregister")
                }
            }
        }
    };
    j.catalog = new j.Catalog;
    var F = function (f, g) {
        for (var n = Object.keys(g), p = n.length; --p > 0;) f.exec(n[p]) && delete g[n[p]]
    };
    j.getUserPlugins = function () {
        return j.catalog.getPlugins({
            onlyType: "user"
        })
    }
});
bespin.tiki.module("bespin:promise", function (y, j) {
    var x = y("bespin:console").console;
    y("bespin:util/stacktrace");
    var E = 0;
    j._outstanding = [];
    j._recent = [];
    j.Promise = function () {
        this._status = 0;
        this._value = undefined;
        this._onSuccessHandlers = [];
        this._onErrorHandlers = [];
        this._id = E++;
        j._outstanding[this._id] = this
    };
    j.Promise.prototype.isPromise = true;
    j.Promise.prototype.isComplete = function () {
        return this._status != 0
    };
    j.Promise.prototype.isResolved = function () {
        return this._status == 1
    };
    j.Promise.prototype.isRejected =

    function () {
        return this._status == -1
    };
    j.Promise.prototype.then = function (w, t) {
        if (typeof w === "function") if (this._status === 1) w.call(null, this._value);
        else this._status === 0 && this._onSuccessHandlers.push(w);
        if (typeof t === "function") if (this._status === -1) t.call(null, this._value);
        else this._status === 0 && this._onErrorHandlers.push(t);
        return this
    };
    j.Promise.prototype.chainPromise = function (w) {
        var t = new j.Promise;
        t._chainedFrom = this;
        this.then(function (h) {
            try {
                t.resolve(w(h))
            } catch (o) {
                t.reject(o)
            }
        }, function (h) {
            t.reject(h)
        });
        return t
    };
    j.Promise.prototype.resolve = function (w) {
        return this._complete(this._onSuccessHandlers, 1, w, "resolve")
    };
    j.Promise.prototype.reject = function (w) {
        return this._complete(this._onErrorHandlers, -1, w, "reject")
    };
    j.Promise.prototype._complete = function (w, t, h, o) {
        if (this._status != 0) {
            x.group("Promise already closed");
            x.error("Attempted " + o + "() with ", h);
            x.error("Previous status = ", this._status, ", previous value = ", this._value);
            x.trace();
            if (this._completeTrace) {
                x.error("Trace of previous completion:");
                this._completeTrace.log(5)
            }
            x.groupEnd();
            return this
        }
        this._status = t;
        this._value = h;
        w.forEach(function (s) {
            s.call(null, this._value)
        }, this);
        this._onSuccessHandlers.length = 0;
        this._onErrorHandlers.length = 0;
        delete j._outstanding[this._id];
        for (j._recent.push(this); j._recent.length > 20;) j._recent.shift();
        return this
    };
    j.group = function (w) {
        w instanceof Array || (w = Array.prototype.slice.call(arguments));
        if (w.length === 0) return (new j.Promise).resolve([]);
        var t = new j.Promise,
            h = [],
            o = 0,
            s = function (C) {
                return function (v) {
                    h[C] =
                    v;
                    o++;
                    t._status !== -1 && o === w.length && t.resolve(h)
                }
            };
        w.forEach(function (C, v) {
            v = s(v);
            var B = t.reject.bind(t);
            C.then(v, B)
        });
        return t
    }
});
bespin.tiki.module("bespin:proxy", function (y, j) {
    y("util/util");
    var x = y("promise").Promise;
    j.xhr = function (E, w, t, h) {
        var o = new x;
        if (!bespin.proxy || !bespin.proxy.xhr) {
            var s = new XMLHttpRequest;
            s.onreadystatechange = function () {
                if (s.readyState === 4) {
                    var C = s.status;
                    if (C !== 0 && C !== 200) {
                        C = new Error(s.responseText + " (Status " + s.status + ")");
                        C.xhr = s;
                        o.reject(C)
                    } else o.resolve(s.responseText)
                }
            }.bind(this);
            s.open("GET", w, t);
            h && h(s);
            s.send()
        } else bespin.proxy.xhr.call(this, E, w, t, h, o);
        return o
    };
    j.Worker = function (E) {
        return !bespin.proxy || !bespin.proxy.worker ? new Worker(E) : new bespin.proxy.worker(E)
    }
});
bespin.tiki.module("bespin:sandbox", function (y, j) {
    var x = y("tiki"),
        E = y("bespin:util/util"),
        w = y("bespin:plugins").catalog;
    if (w.parent) throw new Error("The sandbox module can't be used inside of a slave catalog!");
    y = function () {
        x.Sandbox.call(this, bespin.tiki.require.loader, {}, []);
        var t = this.require("bespin:plugins").catalog;
        t.parent = w;
        w.children.push(t);
        t.deactivatePlugin = E.clone(w.deactivatePlugin);
        t._extensionsOrdering = E.clone(w._extensionsOrdering);
        t._registerMetadata(E.clone(w.metadata, true))
    };
    y.prototype =
    new x.Sandbox;
    y.prototype.require = function (t, h, o) {
        var s = this.loader.canonical(t, h, o).substring(2).split(":")[0];
        return w.plugins[s].share ? bespin.tiki.sandbox.require(t, h, o) : x.Sandbox.prototype.require.call(this, t, h, o)
    };
    j.Sandbox = y
});
bespin.tiki.module("bespin:util/cookie", function (y, j) {
    var x = function (E, w) {
        return E.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, function (t) {
            if (w && w.indexOf(t) != -1) return t;
            return "\\" + t
        })
    };
    j.get = function (E) {
        E = new RegExp("(?:^|; )" + x(E) + "=([^;]*)");
        return (E = document.cookie.match(E)) ? decodeURIComponent(E[1]) : undefined
    };
    j.set = function (E, w, t) {
        t = t || {};
        if (typeof t.expires == "number") {
            var h = new Date;
            h.setTime(h.getTime() + t.expires * 24 * 60 * 60 * 1E3);
            t.expires = h
        }
        if (t.expires && t.expires.toUTCString) t.expires = t.expires.toUTCString();
        w = encodeURIComponent(w);
        E = E + "=" + w;
        var o;
        for (o in t) {
            E += "; " + o;
            w = t[o];
            if (w !== true) E += "=" + w
        }
        document.cookie = E
    };
    j.remove = function (E) {
        j.set(E, "", {
            expires: -1
        })
    };
    j.isSupported = function () {
        if (!("cookieEnabled" in navigator)) {
            j.set("__djCookieTest__", "CookiesAllowed");
            navigator.cookieEnabled = j.get("__djCookieTest__") == "CookiesAllowed";
            navigator.cookieEnabled && j.remove("__djCookieTest__")
        }
        return navigator.cookieEnabled
    }
});
bespin.tiki.module("bespin:util/scratchcanvas", function (y, j) {
    var x = y("bespin:util/util"),
        E = function () {
            this._canvas = document.getElementById("bespin-scratch-canvas");
            if (x.none(this._canvas)) {
                this._canvas = document.createElement("canvas");
                this._canvas.id = "bespin-scratch-canvas";
                this._canvas.width = 400;
                this._canvas.height = 300;
                this._canvas.style.position = "absolute";
                this._canvas.style.top = "-10000px";
                this._canvas.style.left = "-10000px";
                document.body.appendChild(this._canvas)
            }
        };
    E.prototype.getContext = function () {
        return this._canvas.getContext("2d")
    };
    E.prototype.measureStringWidth = function (t, h) {
        if (x.none(h)) h = "M";
        var o = this.getContext();
        o.save();
        o.font = t;
        t = o.measureText(h).width;
        o.restore();
        return t
    };
    var w = null;
    j.get = function () {
        if (w === null) w = new E;
        return w
    }
});
bespin.tiki.module("bespin:util/stacktrace", function (y, j) {
    function x(v) {
        for (var B = 0; B < v.length; ++B) {
            var F = v[B];
            if (typeof F == "object") v[B] = "#object";
            else if (typeof F == "function") v[B] = "#function";
            else if (typeof F == "string") v[B] = '"' + F + '"'
        }
        return v.join(",")
    }
    function E() {}
    var w = y("bespin:util/util"),
        t = y("bespin:console").console,
        h = function () {
            if (w.isMozilla) return "firefox";
            else if (w.isOpera) return "opera";
            else if (w.isSafari) return "other";
            try {
                0()
            } catch (v) {
                if (v.arguments) return "chrome";
                if (v.stack) return "firefox";
                if (window.opera && !("stacktrace" in v)) return "opera"
            }
            return "other"
        }(),
        o = {
            chrome: function (v) {
                var B = v.stack;
                if (!B) {
                    t.log(v);
                    return []
                }
                return B.replace(/^.*?\n/, "").replace(/^.*?\n/, "").replace(/^.*?\n/, "").replace(/^[^\(]+?[\n$]/gm, "").replace(/^\s+at\s+/gm, "").replace(/^Object.<anonymous>\s*\(/gm, "{anonymous}()@").split("\n")
            },
            firefox: function (v) {
                var B = v.stack;
                if (!B) {
                    t.log(v);
                    return []
                }
                B = B.replace(/(?:\n@:0)?\s+$/m, "");
                B = B.replace(/^\(/gm, "{anonymous}(");
                return B.split("\n")
            },
            opera: function (v) {
                v = v.message.split("\n");
                var B = /Line\s+(\d+).*?script\s+(http\S+)(?:.*?in\s+function\s+(\S+))?/i,
                    F, f, g;
                F = 4;
                f = 0;
                for (g = v.length; F < g; F += 2) if (B.test(v[F])) v[f++] = (RegExp.$3 ? RegExp.$3 + "()@" + RegExp.$2 + RegExp.$1 : "{anonymous}()@" + RegExp.$2 + ":" + RegExp.$1) + " -- " + v[F + 1].replace(/^\s+/, "");
                v.splice(f, v.length - f);
                return v
            },
            other: function (v) {
                for (var B = /function\s*([\w\-$]+)?\s*\(/i, F = [], f = 0, g, n; v && F.length < 10;) {
                    g = B.test(v.toString()) ? RegExp.$1 || "{anonymous}" : "{anonymous}";n = Array.prototype.slice.call(v.arguments);F[f++] = g + "(" + x(n) + ")";
                    if (v === v.caller && window.opera) break;v = v.caller
                }
                return F
            }
        };
    E.prototype = {
        sourceCache: {},
        ajax: function (v) {
            var B = this.createXMLHTTPObject();
            if (B) {
                B.open("GET", v, false);
                B.setRequestHeader("User-Agent", "XMLHTTP/1.0");
                B.send("");
                return B.responseText
            }
        },
        createXMLHTTPObject: function () {
            for (var v, B = [function () {
                return new XMLHttpRequest
            }, function () {
                return new ActiveXObject("Msxml2.XMLHTTP")
            }, function () {
                return new ActiveXObject("Msxml3.XMLHTTP")
            }, function () {
                return new ActiveXObject("Microsoft.XMLHTTP")
            }], F = 0; F < B.length; F++) try {
                v = B[F]();
                this.createXMLHTTPObject = B[F];
                return v
            } catch (f) {}
        },
        getSource: function (v) {
            v in this.sourceCache || (this.sourceCache[v] = this.ajax(v).split("\n"));
            return this.sourceCache[v]
        },
        guessFunctions: function (v) {
            for (var B = 0; B < v.length; ++B) {
                var F = v[B],
                    f = /{anonymous}\(.*\)@(\w+:\/\/([-\w\.]+)+(:\d+)?[^:]+):(\d+):?(\d+)?/.exec(F);
                if (f) {
                    var g = f[1];
                    f = f[4];
                    if (g && f) {
                        g = this.guessFunctionName(g, f);
                        v[B] = F.replace("{anonymous}", g)
                    }
                }
            }
            return v
        },
        guessFunctionName: function (v, B) {
            try {
                return this.guessFunctionNameFromLines(B, this.getSource(v))
            } catch (F) {
                return "getSource failed with url: " + v + ", exception: " + F.toString()
            }
        },
        guessFunctionNameFromLines: function (v, B) {
            for (var F = /function ([^(]*)\(([^)]*)\)/, f = /['"]?([0-9A-Za-z_]+)['"]?\s*[:=]\s*(function|eval|new Function)/, g = "", n = 0; n < 10; ++n) {
                g = B[v - n] + g;
                if (g !== undefined) {
                    var p = f.exec(g);
                    if (p) return p[1];
                    else p = F.exec(g);
                    if (p && p[1]) return p[1]
                }
            }
            return "(?)"
        }
    };
    var s = new E,
        C = [/http:\/\/localhost:4020\/sproutcore.js:/];
    j.ignoreFramesMatching = function (v) {
        C.push(v)
    };
    j.Trace = function (v, B) {
        this._ex = v;
        this._stack = o[h](v);
        if (B) this._stack = s.guessFunctions(this._stack)
    };
    j.Trace.prototype.log = function (v) {
        if (v <= 0) v = 999999999;
        for (var B = 0, F = 0; F < this._stack.length && B < v; F++) {
            var f = this._stack[F],
                g = true;
            C.forEach(function (n) {
                if (n.test(f)) g = false
            });
            if (g) {
                t.debug(f);
                B++
            }
        }
    }
});
bespin.tiki.module("bespin:util/util", function (y, j) {
    j.queryToObject = function (h, o) {
        var s = {};
        h = h.split(o || "&");
        var C = decodeURIComponent;
        h.forEach(function (v) {
            if (v.length) {
                var B = v.split("=");
                v = C(B.shift());
                B = C(B.join("="));
                if (j.isString(s[v])) s[v] = [s[v]];
                if (Array.isArray(s[v])) s[v].push(B);
                else s[v] = B
            }
        });
        return s
    };
    j.objectToQuery = function (h) {
        var o = encodeURIComponent,
            s = [],
            C = {};
        for (var v in h) {
            var B = h[v];
            if (B != C[v]) {
                var F = o(v) + "=";
                if (B.isArray) for (var f = 0; f < B.length; f++) s.push(F + o(B[f]));
                else s.push(F + o(B))
            }
        }
        return s.join("&")
    };
    var x = 0,
        E = {};
    j.rateLimit = function (h, o, s) {
        if (h) {
            var C = x++;
            return function () {
                E[C] && clearTimeout(E[C]);
                E[C] = setTimeout(function () {
                    s.apply(o, arguments);
                    delete E[C]
                }, h)
            }
        }
    };
    j.isString = function (h) {
        return typeof h == "string" || h instanceof String
    };
    j.isBoolean = function (h) {
        return typeof h == "boolean"
    };
    j.isNumber = function (h) {
        return typeof h == "number" && isFinite(h)
    };
    j.isObject = function (h) {
        return h !== undefined && (h === null || typeof h == "object" || Array.isArray(h) || j.isFunction(h))
    };
    j.isFunction =

    function () {
        var h = function (o) {
            var s = typeof o;
            return o && (s == "function" || o instanceof Function) && !o.nodeType
        };
        return j.isSafari ?
        function (o) {
            if (typeof o == "function" && o == "[object NodeList]") return false;
            return h(o)
        } : h
    }();
    j.endsWith = function (h, o) {
        if (!h) return false;
        return h.match(new RegExp(o + "$"))
    };
    j.include = function (h, o) {
        return h.indexOf(o) > -1
    };
    j.indexOfProperty = function (h, o, s) {
        for (var C = 0; C < h.length; C++) if (h[C][o] == s) return C;
        return null
    };
    j.last = function (h) {
        if (Array.isArray(h)) return h[h.length - 1]
    };
    j.shrinkArray = function (h) {
        var o = [],
            s = true;
        h.reverse().forEach(function (C) {
            if (!(s && C === undefined)) {
                s = false;
                o.push(C)
            }
        });
        return o.reverse()
    };
    j.makeArray = function (h, o) {
        if (h < 1) return [];
        o || (o = " ");
        for (var s = [], C = 0; C < h; C++) s.push(o);
        return s
    };
    j.repeatString = function (h, o) {
        for (var s = "", C = 0; C < o; C++) s += h;
        return s
    };
    j.leadingSpaces = function (h) {
        for (var o = 0, s = 0; s < h.length; s++) if (h[s] == " " || h[s] == "" || h[s] === undefined) o++;
        else return o;
        return o
    };
    j.leadingTabs = function (h) {
        for (var o = 0, s = 0; s < h.length; s++) if (h[s] == "\t" || h[s] == "" || h[s] === undefined) o++;
        else return o;
        return o
    };
    j.leadingWhitespace = function (h) {
        for (var o = [], s = 0; s < h.length; s++) if (h[s] == " " || h[s] == "\t" || h[s] == "" || h[s] === undefined) o.push(h[s]);
        else return o;
        return o
    };
    j.englishFromCamel = function (h) {
        h.replace(/([A-Z])/g, function (o) {
            return " " + o.toLowerCase()
        }).trim()
    };
    j.OS = {
        LINUX: "LINUX",
        MAC: "MAC",
        WINDOWS: "WINDOWS"
    };
    y = navigator.userAgent;
    var w = navigator.appVersion;
    j.isLinux = w.indexOf("Linux") >= 0;
    j.isWindows = w.indexOf("Win") >= 0;
    j.isWebKit = parseFloat(y.split("WebKit/")[1]) || undefined;
    j.isChrome = parseFloat(y.split("Chrome/")[1]) || undefined;
    j.isMac = w.indexOf("Macintosh") >= 0;
    j.isMozilla = w.indexOf("Gecko/") >= 0;
    if (y.indexOf("AdobeAIR") >= 0) j.isAIR = 1;
    var t = Math.max(w.indexOf("WebKit"), w.indexOf("Safari"), 0);
    if (t && !j.isChrome) {
        j.isSafari = parseFloat(w.split("Version/")[1]);
        if (!j.isSafari || parseFloat(w.substr(t + 7)) <= 419.3) j.isSafari = 2
    }
    if (y.indexOf("Gecko") >= 0 && !j.isWebKit) j.isMozilla = parseFloat(w);
    j.getOS = function () {
        return j.isMac ? j.OS.MAC : j.isLinux ? j.OS.LINUX : j.OS.WINDOWS
    };
    j.contains =
    typeof document !== "undefined" && document.compareDocumentPosition ?
    function (h, o) {
        return h.compareDocumentPosition(o) & 16
    } : function (h, o) {
        return h !== o && (h.contains ? h.contains(o) : true)
    };j.stopEvent = function (h) {
        h.preventDefault();
        h.stopPropagation()
    };j.randomPassword = function (h) {
        h = h || 16;
        for (var o = "", s = 0; s < h; s++) {
            var C = Math.floor(Math.random() * 62);
            o += "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890".charAt(C)
        }
        return o
    };j.isEmpty = function (h) {
        for (var o in h) if (h.hasOwnProperty(o)) return false;
        return true
    };j.isMyProject = function (h) {
        return h.indexOf("+") == -1
    };j.formatDate = function (h) {
        if (!h) return "Unknown";
        return h.getDate() + " " + j.formatDate.shortMonths[h.getMonth()] + " " + h.getFullYear()
    };j.formatDate.shortMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];j.addClass = function (h, o) {
        o = o.split(/\s+/);
        for (var s = " " + h.className + " ", C = 0, v = o.length, B; C < v; ++C) if ((B = o[C]) && s.indexOf(" " + B + " ") < 0) s += B + " ";
        h.className = s.trim()
    };j.removeClass = function (h, o) {
        if (o !== undefined) {
            var s =
            o.split(/\s+/);
            o = " " + h.className + " ";
            for (var C = 0, v = s.length; C < v; ++C) o = o.replace(" " + s[C] + " ", " ");
            o = o.trim()
        } else o = "";
        if (h.className != o) h.className = o
    };j.setClass = function (h, o, s) {
        s ? j.addClass(h, o) : j.removeClass(h, o)
    };j.none = function (h) {
        return h === null || h === undefined
    };j.clone = function (h, o) {
        if (Array.isArray(h) && !o) return h.slice();
        if (typeof h === "object" || Array.isArray(h)) {
            if (h === null) return null;
            var s = Array.isArray(h) ? [] : {};
            for (var C in h) s[C] = o && (typeof h[C] === "object" || Array.isArray(h[C])) ? j.clone(h[C], true) : h[C];
            return s
        }
        if (h.clone && typeof h.clone === "function") return h.clone();
        return h
    };j.mixin = function (h, o) {
        for (var s in o) {
            var C = o.__lookupGetter__(s),
                v = o.__lookupSetter__(s);
            if (C || v) {
                C && h.__defineGetter__(s, C);
                v && h.__defineSetter__(s, v)
            } else h[s] = o[s]
        }
        return h
    };j.replace = function (h, o, s, C) {
        return h.slice(0, o).concat(C).concat(h.slice(o + s))
    };j.rectsEqual = function (h, o, s) {
        if (!h || !o) return h == o;
        if (!s && s !== 0) s = 0.1;
        if (h.y != o.y && Math.abs(h.y - o.y) > s) return false;
        if (h.x != o.x && Math.abs(h.x - o.x) > s) return false;
        if (h.width != o.width && Math.abs(h.width - o.width) > s) return false;
        if (h.height != o.height && Math.abs(h.height - o.height) > s) return false;
        return true
    }
});
bespin.tiki.register("::syntax_directory", {
    name: "syntax_directory",
    dependencies: {}
});
bespin.tiki.module("syntax_directory:index", function (y, j) {
    function x(t) {
        this.extension = t;
        this.name = t.name;
        this.fileExts = t.hasOwnProperty("fileexts") ? t.fileexts : []
    }
    function E(t) {
        w.register(t)
    }
    y("bespin:plugins");
    var w = {
        _fileExts: {},
        _syntaxInfo: {},
        get: function (t) {
            return this._syntaxInfo[t]
        },
        hasSyntax: function (t) {
            return this._syntaxInfo.hasOwnProperty(t)
        },
        register: function (t) {
            var h = new x(t);
            this._syntaxInfo[h.name] = h;
            var o = this._fileExts;
            h.fileExts.forEach(function (s) {
                o[s] = h.name
            })
        },
        syntaxForFileExt: function (t) {
            t =
            t.toLowerCase();
            var h = this._fileExts;
            return h.hasOwnProperty(t) ? h[t] : "plain"
        }
    };
    j.syntaxDirectory = w;
    j.discoveredNewSyntax = E
});
bespin.tiki.register("::underscore", {
    name: "underscore",
    dependencies: {}
});
bespin.tiki.module("underscore:index", function (y, j) {
    (function () {
        var x = this,
            E = x._,
            w = typeof StopIteration !== "undefined" ? StopIteration : "__break__",
            t = function (e) {
                return e.replace(/([.*+?^${}()|[\]\/\\])/g, "\\$1")
            },
            h = Array.prototype,
            o = Object.prototype,
            s = h.slice,
            C = h.unshift,
            v = o.toString,
            B = o.hasOwnProperty,
            F = h.forEach,
            f = h.map,
            g = h.reduce,
            n = h.reduceRight,
            p = h.filter,
            u = h.every,
            A = h.some,
            L = h.indexOf,
            I = h.lastIndexOf;o = Array.isArray;
        var N = Object.keys,
            i = function (e) {
                return new R(e)
            };
        if (typeof j !== "undefined") j._ = i;x._ = i;i.VERSION = "1.0.2";
        var J = i.forEach = function (e, k, r) {
            try {
                if (F && e.forEach === F) e.forEach(k, r);
                else if (i.isNumber(e.length)) for (var q = 0, G = e.length; q < G; q++) k.call(r, e[q], q, e);
                else for (q in e) B.call(e, q) && k.call(r, e[q], q, e)
            } catch (K) {
                if (K != w) throw K;
            }
            return e
        };i.map = function (e, k, r) {
            if (f && e.map === f) return e.map(k, r);
            var q = [];
            J(e, function (G, K, P) {
                q.push(k.call(r, G, K, P))
            });
            return q
        };i.reduce = function (e, k, r, q) {
            if (g && e.reduce === g) return e.reduce(i.bind(r, q), k);
            J(e, function (G, K, P) {
                k = r.call(q, k, G, K, P)
            });
            return k
        };
        i.reduceRight = function (e, k, r, q) {
            if (n && e.reduceRight === n) return e.reduceRight(i.bind(r, q), k);
            e = i.clone(i.toArray(e)).reverse();
            return i.reduce(e, k, r, q)
        };i.detect = function (e, k, r) {
            var q;
            J(e, function (G, K, P) {
                if (k.call(r, G, K, P)) {
                    q = G;
                    i.breakLoop()
                }
            });
            return q
        };i.filter = function (e, k, r) {
            if (p && e.filter === p) return e.filter(k, r);
            var q = [];
            J(e, function (G, K, P) {
                k.call(r, G, K, P) && q.push(G)
            });
            return q
        };i.reject = function (e, k, r) {
            var q = [];
            J(e, function (G, K, P) {
                !k.call(r, G, K, P) && q.push(G)
            });
            return q
        };i.every = function (e, k, r) {
            k = k || i.identity;
            if (u && e.every === u) return e.every(k, r);
            var q = true;
            J(e, function (G, K, P) {
                (q = q && k.call(r, G, K, P)) || i.breakLoop()
            });
            return q
        };i.some = function (e, k, r) {
            k = k || i.identity;
            if (A && e.some === A) return e.some(k, r);
            var q = false;
            J(e, function (G, K, P) {
                if (q = k.call(r, G, K, P)) i.breakLoop()
            });
            return q
        };i.include = function (e, k) {
            if (L && e.indexOf === L) return e.indexOf(k) != -1;
            var r = false;
            J(e, function (q) {
                if (r = q === k) i.breakLoop()
            });
            return r
        };i.invoke = function (e, k) {
            var r = i.rest(arguments, 2);
            return i.map(e, function (q) {
                return (k ? q[k] : q).apply(q, r)
            })
        };i.pluck = function (e, k) {
            return i.map(e, function (r) {
                return r[k]
            })
        };i.max = function (e, k, r) {
            if (!k && i.isArray(e)) return Math.max.apply(Math, e);
            var q = {
                computed: -Infinity
            };
            J(e, function (G, K, P) {
                K = k ? k.call(r, G, K, P) : G;K >= q.computed && (q = {
                    value: G,
                    computed: K
                })
            });
            return q.value
        };i.min = function (e, k, r) {
            if (!k && i.isArray(e)) return Math.min.apply(Math, e);
            var q = {
                computed: Infinity
            };
            J(e, function (G, K, P) {
                K = k ? k.call(r, G, K, P) : G;K < q.computed && (q = {
                    value: G,
                    computed: K
                })
            });
            return q.value
        };i.sortBy = function (e, k, r) {
            return i.pluck(i.map(e, function (q, G, K) {
                return {
                    value: q,
                    criteria: k.call(r, q, G, K)
                }
            }).sort(function (q, G) {
                q = q.criteria;
                G = G.criteria;
                return q < G ? -1 : q > G ? 1 : 0
            }), "value")
        };i.sortedIndex = function (e, k, r) {
            r = r || i.identity;
            for (var q = 0, G = e.length; q < G;) {
                var K = q + G >> 1;
                r(e[K]) < r(k) ? (q = K + 1) : (G = K)
            }
            return q
        };i.toArray = function (e) {
            if (!e) return [];
            if (e.toArray) return e.toArray();
            if (i.isArray(e)) return e;
            if (i.isArguments(e)) return s.call(e);
            return i.values(e)
        };i.size = function (e) {
            return i.toArray(e).length
        };i.first = function (e, k, r) {
            return k && !r ? s.call(e, 0, k) : e[0]
        };i.rest = function (e, k, r) {
            return s.call(e, i.isUndefined(k) || r ? 1 : k)
        };i.last = function (e) {
            return e[e.length - 1]
        };i.compact = function (e) {
            return i.filter(e, function (k) {
                return !!k
            })
        };i.flatten = function (e) {
            return i.reduce(e, [], function (k, r) {
                if (i.isArray(r)) return k.concat(i.flatten(r));
                k.push(r);
                return k
            })
        };i.without = function (e) {
            var k = i.rest(arguments);
            return i.filter(e, function (r) {
                return !i.include(k, r)
            })
        };i.uniq = function (e, k) {
            return i.reduce(e, [], function (r, q, G) {
                if (0 == G || (k === true ? i.last(r) != q : !i.include(r, q))) r.push(q);
                return r
            })
        };i.intersect = function (e) {
            var k = i.rest(arguments);
            return i.filter(i.uniq(e), function (r) {
                return i.every(k, function (q) {
                    return i.indexOf(q, r) >= 0
                })
            })
        };i.zip = function () {
            for (var e = i.toArray(arguments), k = i.max(i.pluck(e, "length")), r = new Array(k), q = 0; q < k; q++) r[q] = i.pluck(e, String(q));
            return r
        };i.indexOf = function (e, k) {
            if (L && e.indexOf === L) return e.indexOf(k);
            for (var r = 0, q = e.length; r < q; r++) if (e[r] === k) return r;
            return -1
        };i.lastIndexOf = function (e, k) {
            if (I && e.lastIndexOf === I) return e.lastIndexOf(k);
            for (var r = e.length; r--;) if (e[r] === k) return r;
            return -1
        };i.range = function (e, k, r) {
            var q = i.toArray(arguments),
                G = q.length <= 1;
            e = G ? 0 : q[0];k = G ? q[0] : q[1];r = q[2] || 1;q = Math.ceil((k - e) / r);
            if (q <= 0) return [];q = new Array(q);G = e;
            for (var K = 0;; G += r) {
                if ((r > 0 ? G - k : k - G) >= 0) return q;
                q[K++] = G
            }
        };i.bind = function (e, k) {
            var r = i.rest(arguments, 2);
            return function () {
                return e.apply(k || {}, r.concat(i.toArray(arguments)))
            }
        };i.bindAll = function (e) {
            var k = i.rest(arguments);
            if (k.length == 0) k = i.functions(e);
            J(k, function (r) {
                e[r] = i.bind(e[r], e)
            });
            return e
        };i.delay = function (e, k) {
            var r = i.rest(arguments, 2);
            return setTimeout(function () {
                return e.apply(e, r)
            }, k)
        };i.defer = function (e) {
            return i.delay.apply(i, [e, 1].concat(i.rest(arguments)))
        };i.wrap = function (e, k) {
            return function () {
                var r = [e].concat(i.toArray(arguments));
                return k.apply(k, r)
            }
        };i.compose = function () {
            var e = i.toArray(arguments);
            return function () {
                for (var k = i.toArray(arguments), r = e.length - 1; r >= 0; r--) k = [e[r].apply(this, k)];
                return k[0]
            }
        };i.keys = N ||
        function (e) {
            if (i.isArray(e)) return i.range(0, e.length);
            var k = [];
            for (var r in e) B.call(e, r) && k.push(r);
            return k
        };i.values = function (e) {
            return i.map(e, i.identity)
        };i.functions = function (e) {
            return i.filter(i.keys(e), function (k) {
                return i.isFunction(e[k])
            }).sort()
        };i.extend = function (e) {
            J(i.rest(arguments), function (k) {
                for (var r in k) e[r] = k[r]
            });
            return e
        };i.clone = function (e) {
            if (i.isArray(e)) return e.slice(0);
            return i.extend({}, e)
        };i.tap = function (e, k) {
            k(e);
            return e
        };i.isEqual = function (e, k) {
            if (e === k) return true;
            var r = typeof e;
            if (r != typeof k) return false;
            if (e == k) return true;
            if (!e && k || e && !k) return false;
            if (e.isEqual) return e.isEqual(k);
            if (i.isDate(e) && i.isDate(k)) return e.getTime() === k.getTime();
            if (i.isNaN(e) && i.isNaN(k)) return true;
            if (i.isRegExp(e) && i.isRegExp(k)) return e.source === k.source && e.global === k.global && e.ignoreCase === k.ignoreCase && e.multiline === k.multiline;
            if (r !== "object") return false;
            if (e.length && e.length !== k.length) return false;
            r = i.keys(e);
            var q = i.keys(k);
            if (r.length != q.length) return false;
            for (var G in e) if (!(G in k) || !i.isEqual(e[G], k[G])) return false;
            return true
        };i.isEmpty = function (e) {
            if (i.isArray(e) || i.isString(e)) return e.length === 0;
            for (var k in e) if (B.call(e, k)) return false;
            return true
        };i.isElement = function (e) {
            return !!(e && e.nodeType == 1)
        };i.isArray = o ||
        function (e) {
            return !!(e && e.concat && e.unshift && !e.callee)
        };i.isArguments = function (e) {
            return e && e.callee
        };i.isFunction = function (e) {
            return !!(e && e.constructor && e.call && e.apply)
        };i.isString = function (e) {
            return !!(e === "" || e && e.charCodeAt && e.substr)
        };i.isNumber = function (e) {
            return e === +e || v.call(e) === "[object Number]"
        };
        i.isBoolean = function (e) {
            return e === true || e === false
        };i.isDate = function (e) {
            return !!(e && e.getTimezoneOffset && e.setUTCFullYear)
        };i.isRegExp = function (e) {
            return !!(e && e.test && e.exec && (e.ignoreCase || e.ignoreCase === false))
        };i.isNaN = function (e) {
            return i.isNumber(e) && isNaN(e)
        };i.isNull = function (e) {
            return e === null
        };i.isUndefined = function (e) {
            return typeof e == "undefined"
        };i.noConflict = function () {
            x._ = E;
            return this
        };i.identity = function (e) {
            return e
        };i.times = function (e, k, r) {
            for (var q = 0; q < e; q++) k.call(r, q)
        };i.breakLoop =

        function () {
            throw w;
        };i.mixin = function (e) {
            J(i.functions(e), function (k) {
                Q(k, i[k] = e[k])
            })
        };
        var U = 0;i.uniqueId = function (e) {
            var k = U++;
            return e ? e + k : k
        };i.templateSettings = {
            start: "<%",
            end: "%>",
            interpolate: /<%=(.+?)%>/g
        };i.template = function (e, k) {
            var r = i.templateSettings,
                q = new RegExp("'(?=[^" + r.end.substr(0, 1) + "]*" + t(r.end) + ")", "g");
            e = new Function("obj", "var p=[],print=function(){p.push.apply(p,arguments);};with(obj){p.push('" + e.replace(/[\r\t\n]/g, " ").replace(q, "\t").split("'").join("\\'").split("\t").join("'").replace(r.interpolate, "',$1,'").split(r.start).join("');").split(r.end).join("p.push('") + "');}return p.join('');");
            return k ? e(k) : e
        };i.each = i.forEach;i.foldl = i.inject = i.reduce;i.foldr = i.reduceRight;i.select = i.filter;i.all = i.every;i.any = i.some;i.head = i.first;i.tail = i.rest;i.methods = i.functions;
        var R = function (e) {
            this._wrapped = e
        },
            S = function (e, k) {
                return k ? i(e).chain() : e
            },
            Q = function (e, k) {
                R.prototype[e] = function () {
                    var r = i.toArray(arguments);
                    C.call(r, this._wrapped);
                    return S(k.apply(i, r), this._chain)
                }
            };i.mixin(i);J(["pop", "push", "reverse", "shift", "sort", "splice", "unshift"], function (e) {
            var k = h[e];
            R.prototype[e] = function () {
                k.apply(this._wrapped, arguments);
                return S(this._wrapped, this._chain)
            }
        });J(["concat", "join", "slice"], function (e) {
            var k = h[e];
            R.prototype[e] = function () {
                return S(k.apply(this._wrapped, arguments), this._chain)
            }
        });R.prototype.chain = function () {
            this._chain = true;
            return this
        };R.prototype.value = function () {
            return this._wrapped
        }
    })();
    j._.noConflict()
});
bespin.tiki.require("bespin:plugins").catalog.registerMetadata({
    bespin: {
        testmodules: [],
        resourceURL: "resources/bespin/",
        name: "bespin",
        environments: {
            main: true,
            worker: true
        },
        type: "plugins/boot"
    },
    syntax_directory: {
        resourceURL: "resources/syntax_directory/",
        name: "syntax_directory",
        environments: {
            main: true,
            worker: true
        },
        dependencies: {},
        testmodules: [],
        provides: [{
            register: "#discoveredNewSyntax",
            ep: "extensionhandler",
            name: "syntax"
        }],
        type: "plugins/supported",
        description: "Catalogs the available syntax engines"
    },
    underscore: {
        testmodules: [],
        type: "plugins/thirdparty",
        resourceURL: "resources/underscore/",
        description: "Functional Programming Aid for Javascript. Works well with jQuery.",
        name: "underscore"
    }
});
typeof window === "undefined" ? importScripts("BespinWorker-debug.js") : function () {
    var y = document.createElement("script");
    y.setAttribute("src", bespin.base + "BespinMain-debug.js");
    document.getElementsByTagName("head")[0].appendChild(y)
}();