bespin.tiki.register("::text_editor", {
    name: "text_editor",
    dependencies: {
        completion: "0.0.0",
        undomanager: "0.0.0",
        settings: "0.0.0",
        canon: "0.0.0",
        rangeutils: "0.0.0",
        traits: "0.0.0",
        theme_manager: "0.0.0",
        keyboard: "0.0.0",
        edit_session: "0.0.0",
        syntax_manager: "0.0.0"
    }
});
bespin.tiki.module("text_editor:commands/editing", function (y, s) {
    var v = y("settings").settings,
        r = y("environment").env,
        l = y("rangeutils:utils/range");
    s.backspace = function () {
        r.view.performBackspaceOrDelete(true)
    };
    s.deleteCommand = function () {
        r.view.performBackspaceOrDelete(false)
    };
    s.deleteLines = function () {
        if (!r.model.readOnly) if (r.model.lines.length != 1) {
            var d = r.view;
            d.groupChanges(function () {
                var f = d.getSelectedRange(),
                    m = r.model.lines,
                    i = m.length - 1,
                    g;
                g = f.start.row == i ? {
                    col: m[i - 1].length,
                    row: i - 1
                } : {
                    col: 0,
                    row: f.start.row
                };
                d.replaceCharacters({
                    start: g,
                    end: f.end.row == i ? {
                        col: m[i].length,
                        row: i
                    } : {
                        col: 0,
                        row: f.end.row + 1
                    }
                }, "");d.moveCursorTo(g)
            })
        }
    };
    var h = function (d, f) {
        var m = f.getSelectedRange().start;
        d = /^\s*/.exec(d.lines[m.row].substring(0, m.col));
        f.insertText("\n" + d)
    };
    s.insertText = function (d) {
        r.view.insertText(d.text)
    };
    s.newline = function () {
        h(r.model, r.view)
    };
    s.joinLines = function () {
        var d = r.model;
        if (!d.readOnly) {
            var f = r.view,
                m = f.getSelectedRange(),
                i = d.lines,
                g = m.end.row;
            i.length != g && f.groupChanges(function () {
                f.replaceCharacters({
                    start: {
                        col: i[g].length,
                        row: g
                    },
                    end: {
                        col: /^\s*/.exec(i[g + 1])[0].length,
                        row: g + 1
                    }
                }, "")
            })
        }
    };
    s.openLine = function () {
        if (!r.model.readOnly) {
            var d = r.model,
                f = r.view,
                m = f.getSelectedRange().end.row;
            f.moveCursorTo({
                row: m,
                col: d.lines[m].length
            });
            h(d, f)
        }
    };
    s.tab = function () {
        var d = r.view;
        d.groupChanges(function () {
            var f = v.get("tabstop"),
                m = d.getSelectedRange(),
                i = "";
            if (l.isZeroLength(m)) {
                var g = r.model.lines[m.start.row].substring(m.start.col).match(/^\s*/)[0].length;
                f = f - (m.start.col + g) % f;
                for (var j = 0; j < f; j++) i += " ";
                d.replaceCharacters({
                    start: m.start,
                    end: m.start
                }, i);
                d.moveCursorTo({
                    col: m.start.col + f + g,
                    row: m.end.row
                })
            } else {
                for (j = 0; j < f; j++) i += " ";
                for (j = m.start.row - 1; j++ < m.end.row;) {
                    g = j == m.start.row ? m.start.col : 0;d.replaceCharacters({
                        start: {
                            row: j,
                            col: g
                        },
                        end: {
                            row: j,
                            col: g
                        }
                    }, i)
                }
                d.setSelection({
                    start: m.start,
                    end: {
                        col: m.end.col + f,
                        row: m.end.row
                    }
                })
            }
        }.bind(this))
    };
    s.untab = function () {
        var d = r.view;
        d.groupChanges(function () {
            var f = v.get("tabstop"),
                m = d.getSelectedRange(),
                i = r.model.lines,
                g = 0;
            if (l.isZeroLength(m)) {
                g = Math.min(i[m.start.row].substring(0, m.start.col).match(/\s*$/)[0].length, (m.start.col - f) % f || f);
                d.replaceCharacters({
                    start: {
                        col: m.start.col - g,
                        row: m.start.row
                    },
                    end: m.start
                }, "");
                d.moveCursorTo({
                    row: m.start.row,
                    col: m.end.col - g
                })
            } else {
                for (var j, q = m.start.row - 1; q++ < m.end.row;) {
                    j = q == m.start.row ? m.start.col : 0;g = Math.min(i[q].substring(j).match(/^\s*/)[0].length, f);d.replaceCharacters({
                        start: {
                            row: q,
                            col: j
                        },
                        end: {
                            row: q,
                            col: j + g
                        }
                    }, "")
                }
                d.setSelection({
                    start: {
                        row: m.start.row,
                        col: m.start.col
                    },
                    end: {
                        row: m.end.row,
                        col: m.end.col - g
                    }
                })
            }
        }.bind(this))
    }
});
bespin.tiki.module("text_editor:commands/editor", function (y, s) {
    y("bespin:plugins");
    var v = y("settings").settings,
        r = y("environment").env;
    s.findNextCommand = function () {
        var h = r.view,
            d = h.editor.searchController,
            f = h.getSelectedRange();
        if (d = d.findNext(f.end, true)) {
            h.setSelection(d, true);
            h.focus()
        }
    };
    s.findPrevCommand = function () {
        var h = r.view,
            d = h.editor.searchController,
            f = h.getSelectedRange();
        if (d = d.findPrevious(f.start, true)) {
            h.setSelection(d, true);
            h.focus()
        }
    };
    var l = function (h) {
        var d = r.view,
            f = d.getSelectedCharacters();
        h = h(f);
        d = d.getSelectedRange();
        r.model.replaceCharacters(d, h)
    };
    s.replaceCommand = function (h) {
        l(function (d) {
            return d.replace(h.search + "/g", h.replace)
        })
    };
    s.entabCommand = function () {
        tabstop = v.get("tabstop");
        l(function (h) {
            return h.replace(" {" + tabstop + "}", "\t")
        })
    };
    s.detabCommand = function () {
        tabstop = v.get("tabstop");
        l(function (h) {
            return h.replace("\t", (new Array(tabstop + 1)).join(" "))
        })
    };
    s.trimCommand = function (h) {
        l(function (d) {
            d = d.split("\n");
            d = d.map(function (f) {
                if (h.side === "left" || h.side === "both") f = f.replace(/^\s+/, "");
                if (h.side === "right" || h.side === "both") f = f.replace(/\s+$/, "");
                return f
            });
            return d.join("\n")
        })
    };
    s.ucCommand = function () {
        l(function (h) {
            return h.toUpperCase()
        })
    };
    s.lcCommand = function () {
        l(function (h) {
            return h.toLowerCase()
        })
    }
});
bespin.tiki.module("text_editor:commands/movement", function (y, s) {
    y("rangeutils:utils/range");
    var v = y("environment").env;
    s.moveDown = function () {
        v.view.moveDown()
    };
    s.moveLeft = function () {
        v.view.moveLeft()
    };
    s.moveRight = function () {
        v.view.moveRight()
    };
    s.moveUp = function () {
        v.view.moveUp()
    };
    s.selectDown = function () {
        v.view.selectDown()
    };
    s.selectLeft = function () {
        v.view.selectLeft()
    };
    s.selectRight = function () {
        v.view.selectRight()
    };
    s.selectUp = function () {
        v.view.selectUp()
    };
    var r = function (m, i) {
        var g = v.view,
            j = v.model.lines,
            q = g.getSelectedRange(true);
        i = i ? q.end.row : j.length - 1;g.moveCursorTo({
            row: i,
            col: j[i].length
        }, m)
    };
    s.moveLineEnd = function () {
        r(false, true)
    };
    s.selectLineEnd = function () {
        r(true, true)
    };
    s.moveDocEnd = function () {
        r(false, false)
    };
    s.selectDocEnd = function () {
        r(true, false)
    };
    var l = function (m, i) {
        var g = v.view,
            j = g.getSelectedRange(true);
        g.moveCursorTo({
            row: i ? j.end.row : 0,
            col: 0
        }, m)
    };
    s.moveLineStart = function () {
        l(false, true)
    };
    s.selectLineStart = function () {
        l(true, true)
    };
    s.moveDocStart = function () {
        l(false, false)
    };
    s.selectDocStart =

    function () {
        l(true, false)
    };
    var h = function (m, i, g, j, q) {
        var t = 0,
            B = false;
        if (j < 0) {
            g--;
            if (q) t = 1
        }
        for (; g < i.length && g > -1;) {
            if (q = m.isDelimiter(i[g])) t++;
            else B = true;
            if ((q || t > 1) && B) break;
            g += j
        }
        j < 0 && g++;
        return g
    },
        d = function (m) {
            var i = v.view,
                g = v.model.lines,
                j = i.getSelectedRange(true).end,
                q = j.row;
            j = j.col;
            var t = g[q],
                B = false;
            if (j >= t.length) {
                q++;
                B = true;
                if (q < g.length) {
                    j = 0;
                    t = g[q]
                } else t = ""
            }
            j = h(i, t, j, 1, B);
            i.moveCursorTo({
                row: q,
                col: j
            }, m)
        },
        f = function (m) {
            var i = v.view,
                g = v.model.lines,
                j = i.getSelectedRange(true).end,
                q = j.row;
            j = j.col;
            var t = g[q],
                B = false;
            if (j > t.length) j = t.length;
            else if (j == 0) {
                q--;
                B = true;
                if (q > -1) {
                    t = g[q];
                    j = t.length
                } else t = ""
            }
            j = h(i, t, j, -1, B);
            i.moveCursorTo({
                row: q,
                col: j
            }, m)
        };
    s.moveNextWord = function () {
        d(false)
    };
    s.selectNextWord = function () {
        d(true)
    };
    s.movePreviousWord = function () {
        f(false)
    };
    s.selectPreviousWord = function () {
        f(true)
    };
    s.selectAll = function () {
        v.view.selectAll()
    }
});
bespin.tiki.module("text_editor:commands/scrolling", function (y, s) {
    var v = y("environment").env;
    s.scrollDocStart = function () {
        v.view.scrollToPosition({
            col: 0,
            row: 0
        })
    };
    s.scrollDocEnd = function () {
        v.view.scrollToPosition(v.model.range.end)
    };
    s.scrollPageDown = function () {
        v.view.scrollPageDown()
    };
    s.scrollPageUp = function () {
        v.view.scrollPageUp()
    }
});
bespin.tiki.module("text_editor:controllers/layoutmanager", function (y, s) {
    var v = y("bespin:util/util"),
        r = y("events").Event;
    y("rangeutils:utils/range");
    var l = y("syntax_manager").SyntaxManager,
        h = y("models/textstorage").TextStorage,
        d = y("bespin:plugins").catalog,
        f = y("settings").settings,
        m = y("bespin:util/scratchcanvas"),
        i = {};
    y = function () {
        var g = f.get("fontsize"),
            j = f.get("fontface");
        j = g + "px " + j;
        for (var q = m.get(), t = "", B = 0; B < 100; B++) t += "M";
        j = q.measureStringWidth(j, t) / 100;
        i.characterWidth = j;
        i.lineHeight = Math.floor(g * 1.6);
        i.lineAscent = Math.floor(g * 1.3)
    };
    y();
    d.registerExtension("settingChange", {
        match: "font[size|face]",
        pointer: y
    });
    s.LayoutManager = function (g) {
        this.changedTextAtRow = new r;
        this.invalidatedRects = new r;
        this.fontDimension = i;
        if (g.textStorage) {
            g._textStorage = g.textStorage;
            delete g.textStorage
        } else this._textStorage = new h;
        v.mixin(this, g);
        this._textStorage.changed.add(this.textStorageChanged.bind(this));
        this.textLines = [{
            characters: "",
            colors: [{
                start: 0,
                end: 0,
                color: "plain"
            }]
        }];
        this.syntaxManager = g = new l(this);
        g.attrsChanged.add(this._attrsChanged.bind(this));
        this._size = {
            width: 0,
            height: 0
        };
        this.sizeChanged = new r;
        this._height = 0;
        this._recomputeEntireLayout()
    };
    s.LayoutManager.prototype = {
        _maximumWidth: 0,
        _textStorage: null,
        _size: null,
        sizeChanged: null,
        _theme: {},
        margin: {
            left: 5,
            bottom: 6,
            top: 0,
            right: 12
        },
        pluginCatalog: d,
        syntaxManager: null,
        textLines: null,
        _attrsChanged: function (g, j) {
            this.updateTextRows(g, j);
            this.invalidatedRects(this, this.rectsForRange({
                start: {
                    row: g,
                    col: 0
                },
                end: {
                    row: j,
                    col: 0
                }
            }))
        },
        _computeInvalidRects: function (g, j) {
            var q = this.characterRectForPosition(g.start),
                t = {
                    x: q.x,
                    y: q.y,
                    width: Number.MAX_VALUE,
                    height: q.height
                };
            return g.end.row === j.end.row ? [t] : [t,
            {
                x: 0,
                y: q.y + i.lineHeight,
                width: Number.MAX_VALUE,
                height: Number.MAX_VALUE
            }]
        },
        _lastCharacterPosition: function () {
            return {
                row: this.textLines.length - 1,
                col: this._maximumWidth
            }
        },
        _recalculateMaximumWidth: function () {
            var g = 0;
            this.textLines.forEach(function (j) {
                j = j.characters.length;
                if (g < j) g = j
            });
            this._maximumWidth = g;
            this.size = {
                width: g,
                height: this.textLines.length
            }
        },
        _recomputeEntireLayout: function () {
            var g =
            this._textStorage.range;
            this._recomputeLayoutForRanges(g, g)
        },
        _recomputeLayoutForRanges: function (g, j) {
            for (var q = g.start.row, t = g.end.row, B = j.end.row, C = B - q + 1, e = this._textStorage.lines, K = this._theme.plain, L = [], n = 0; n < C; n++) L[n] = {
                characters: e[q + n],
                colors: [{
                    start: 0,
                    end: null,
                    color: K
                }]
            };
            this.textLines = v.replace(this.textLines, q, t - q + 1, L);
            this._recalculateMaximumWidth();
            t = this.textLines.length;
            C = this.syntaxManager;
            if (this._height !== t) this._height = t;
            C.invalidateRow(q);
            this.updateTextRows(q, B + 1);
            this.changedTextAtRow(this, q);
            this.invalidatedRects(this, this._computeInvalidRects(g, j))
        },
        boundingRect: function () {
            return this.rectsForRange({
                start: {
                    row: 0,
                    col: 0
                },
                end: {
                    row: this.textLines.length - 1,
                    col: this._maximumWidth
                }
            })[0]
        },
        characterAtPoint: function (g) {
            var j = this.margin,
                q = g.x - j.left,
                t = i.characterWidth,
                B = this._textStorage;
            g = B.clampPosition({
                row: Math.floor((g.y - j.top) / i.lineHeight),
                col: Math.floor(q / t)
            });
            B = B.lines[g.row].length;
            g.partialFraction = q < 0 || g.col === B ? 0 : q % t / t;
            return g
        },
        characterRangeForBoundingRect: function (g) {
            var j =
            i.lineHeight,
                q = i.characterWidth,
                t = this.margin,
                B = g.x - t.left;
            t = g.y - t.top;
            return {
                start: {
                    row: Math.max(Math.floor(t / j), 0),
                    col: Math.max(Math.floor(B / q), 0)
                },
                end: {
                    row: Math.floor((t + g.height - 1) / j),
                    col: Math.floor((B + g.width - 1) / q) + 1
                }
            }
        },
        characterRectForPosition: function (g) {
            return this.rectsForRange({
                start: g,
                end: {
                    row: g.row,
                    col: g.col + 1
                }
            })[0]
        },
        lineRectForRow: function (g) {
            return this.rectsForRange({
                start: {
                    row: g,
                    col: 0
                },
                end: {
                    row: g,
                    col: this._maximumWidth
                }
            })[0]
        },
        rectForPosition: function (g) {
            var j = this.margin,
                q = i.characterWidth,
                t = i.lineHeight;
            return {
                x: j.left + q * g.col,
                y: j.top + t * g.row,
                width: q,
                height: t
            }
        },
        rectsForRange: function (g) {
            var j = i.characterWidth,
                q = i.lineHeight,
                t = this._maximumWidth,
                B = this.margin,
                C = g.start,
                e = g.end;
            g = C.row;
            var K = C.col;
            C = e.row;
            e = e.col;
            if (g === C) return [{
                x: B.left + j * K,
                y: B.top + q * g,
                width: j * (e - K),
                height: q
            }];
            var L = [],
                n;
            if (K === 0) n = g;
            else {
                n = g + 1;
                L.push({
                    x: B.left + j * K,
                    y: B.top + q * g,
                    width: 99999,
                    height: q
                })
            }
            if (e === 0) t = C - 1;
            else if (e === t) t = C;
            else {
                t = C - 1;
                L.push({
                    x: B.left,
                    y: B.top + q * C,
                    width: j * e,
                    height: q
                })
            }
            L.push({
                x: B.left,
                y: B.top + q * n,
                width: 99999,
                height: q * (t - n + 1)
            });
            return L
        },
        textStorageChanged: function (g, j) {
            this._recomputeLayoutForRanges(g, j)
        },
        updateTextRows: function (g, j) {
            var q = this.textLines;
            j = this.syntaxManager.getAttrsForRows(g, j);
            for (var t = 0; t < j.length; t++) q[g + t].colors = j[t]
        }
    };
    Object.defineProperties(s.LayoutManager.prototype, {
        size: {
            set: function (g) {
                if (g.width !== this._size.width || g.height !== this._size.height) {
                    this.sizeChanged(g);
                    this._size = g
                }
            },
            get: function () {
                return this._size
            }
        },
        textStorage: {
            get: function () {
                return this._textStorage
            }
        }
    })
});
bespin.tiki.module("text_editor:controllers/search", function (y, s) {
    var v = y("bespin:util/util");
    y("rangeutils:utils/range");
    y("bespin:console");
    s.EditorSearchController = function (r) {
        this.editor = r
    };
    s.EditorSearchController.prototype = {
        editor: null,
        _escapeString: /(\/|\.|\*|\+|\?|\||\(|\)|\[|\]|\{|\}|\\)/g,
        _findMatchesInString: function (r) {
            var l = [],
                h = this.searchRegExp,
                d;
            for (h.lastIndex = 0;;) {
                d = h.exec(r);
                if (d === null) break;
                l.push(d);
                h.lastIndex = d.index + d[0].length
            }
            return l
        },
        _makeRange: function (r, l) {
            return {
                start: {
                    row: l,
                    col: r.index
                },
                end: {
                    row: l,
                    col: r.index + r[0].length
                }
            }
        },
        isRegExp: null,
        searchRegExp: null,
        searchText: null,
        setSearchText: function (r, l) {
            this.searchRegExp = l ? new RegExp(r) : new RegExp(r.replace(this._escapeString, "\\$1"), "gi");this.isRegExp = l;this.searchText = r
        },
        findNext: function (r, l) {
            var h = this.searchRegExp;
            if (v.none(h)) return null;
            r = r || this.editor.textView.getSelectedRange().end;
            var d = this.editor.layoutManager.textStorage.lines,
                f;
            h.lastIndex = r.col;
            var m;
            for (m = r.row; m < d.length; m++) {
                f = h.exec(d[m]);
                if (!v.none(f)) return this._makeRange(f, m)
            }
            if (!l) return null;
            for (m = 0; m <= r.row; m++) {
                f = h.exec(d[m]);
                if (!v.none(f)) return this._makeRange(f, m)
            }
            return null
        },
        findPrevious: function (r, l) {
            if (v.none(this.searchRegExp)) return null;
            r = r || this.editor.textView.getSelectedRange().start;
            var h = this.editor.buffer.layoutManager.textStorage.lines,
                d;
            d = this._findMatchesInString(h[r.row].substring(0, r.col));
            if (d.length !== 0) return this._makeRange(d[d.length - 1], r.row);
            var f;
            for (f = r.row - 1; f !== -1; f--) {
                d = this._findMatchesInString(h[f]);
                if (d.length !== 0) return this._makeRange(d[d.length - 1], f)
            }
            if (!l) return null;
            for (f = h.length - 1; f >= r.row; f--) {
                d = this._findMatchesInString(h[f]);
                if (d.length !== 0) return this._makeRange(d[d.length - 1], f)
            }
            return null
        }
    }
});
bespin.tiki.module("text_editor:controllers/undo", function (y, s) {
    var v = y("bespin:console").console,
        r = y("environment").env;
    s.EditorUndoController = function (l) {
        this.editor = l;
        l = this.textView = l.textView;
        l.beganChangeGroup.add(function (h, d) {
            this._beginTransaction();
            this._record.selectionBefore = d
        }.bind(this));
        l.endedChangeGroup.add(function (h, d) {
            this._record.selectionAfter = d;
            this._endTransaction()
        }.bind(this));
        l.replacedCharacters.add(function (h, d, f) {
            if (!this._inTransaction) throw new Error("UndoController.textViewReplacedCharacters() called outside a transaction");
            this._record.patches.push({
                oldCharacters: this._deletedCharacters,
                oldRange: d,
                newCharacters: f,
                newRange: this.editor.layoutManager.textStorage.resultingRangeForReplacement(d, f.split("\n"))
            });
            this._deletedCharacters = null
        }.bind(this));
        l.willReplaceRange.add(function (h, d) {
            if (!this._inTransaction) throw new Error("UndoController.textViewWillReplaceRange() called outside a transaction");
            this._deletedCharacters = this.editor.layoutManager.textStorage.getCharacters(d)
        }.bind(this))
    };
    s.EditorUndoController.prototype = {
        _inTransaction: false,
        _record: null,
        textView: null,
        _beginTransaction: function () {
            if (this._inTransaction) {
                v.trace();
                throw new Error("UndoController._beginTransaction() called with a transaction already in place");
            }
            this._inTransaction = true;
            this._record = {
                patches: []
            }
        },
        _endTransaction: function () {
            if (!this._inTransaction) throw new Error("UndoController._endTransaction() called without a transaction in place");
            this.editor.buffer.undoManager.registerUndo(this, this._record);
            this._record = null;
            this._inTransaction =
            false
        },
        _tryApplyingPatches: function (l) {
            var h = this.editor.layoutManager.textStorage;
            l.forEach(function (d) {
                h.replaceCharacters(d.oldRange, d.newCharacters)
            });
            return true
        },
        _undoOrRedo: function (l, h) {
            if (this._inTransaction) throw new Error("UndoController._undoOrRedo() called while in a transaction");
            if (!this._tryApplyingPatches(l)) return false;
            this.textView.setSelection(h, true);
            return true
        },
        redo: function (l) {
            var h = l.patches.concat();
            h.reverse();
            return this._undoOrRedo(h, l.selectionAfter)
        },
        undo: function (l) {
            return this._undoOrRedo(l.patches.map(function (h) {
                return {
                    oldCharacters: h.newCharacters,
                    oldRange: h.newRange,
                    newCharacters: h.oldCharacters,
                    newRange: h.oldRange
                }
            }), l.selectionBefore)
        }
    };
    s.undoManagerCommand = function (l, h) {
        r.editor.buffer.undoManager[h.commandExt.name]()
    }
});
bespin.tiki.module("text_editor:models/buffer", function (y, s) {
    var v = y("environment").env,
        r = y("bespin:util/util"),
        l = y("bespin:promise").Promise,
        h = y("models/textstorage").TextStorage,
        d = y("controllers/layoutmanager").LayoutManager,
        f = y("undomanager").UndoManager;
    s.Buffer = function (m, i) {
        this._file = m;
        this._model = new h(i);
        this._layoutManager = new d({
            textStorage: this._model
        });
        this.undoManager = new f;
        if (m) this.reload().then(function () {
            this._updateSyntaxManagerInitialContext()
        }.bind(this));
        else {
            this.loadPromise =
            new l;
            this.loadPromise.resolve()
        }
        i = v.session ? v.session.history : null;
        var g, j, q;
        if (i && m && (g = i.getHistoryForPath(m.path))) {
            j = g.selection;
            q = g.scroll
        }
        this._selectedRange = j || {
            start: {
                row: 0,
                col: 0
            },
            end: {
                row: 0,
                col: 0
            }
        };this._scrollOffset = q || {
            x: 0,
            y: 0
        }
    };
    s.Buffer.prototype = {
        undoManager: null,
        loadPromise: null,
        _scrollOffset: null,
        _selectedRange: null,
        _selectedRangeEndVirtual: null,
        _layoutManager: null,
        _file: null,
        _model: null,
        save: function () {
            return this._file.saveContents(this._model.value)
        },
        saveAs: function (m) {
            var i = new l;
            m.saveContents(this._model.value).then(function () {
                this._file = m;
                this._updateSyntaxManagerInitialContext();
                i.resolve()
            }.bind(this), function (g) {
                i.reject(g)
            });
            return i
        },
        reload: function () {
            var m = this,
                i;
            return this.loadPromise = i = this._file.loadContents().then(function (g) {
                m._model.value = g
            })
        },
        _updateSyntaxManagerInitialContext: function () {
            var m = this._file.extension();
            this._layoutManager.syntaxManager.setSyntaxFromFileExt(m === null ? "" : m)
        },
        untitled: function () {
            return r.none(this._file)
        }
    };
    Object.defineProperties(s.Buffer.prototype, {
        layoutManager: {
            get: function () {
                return this._layoutManager
            }
        },
        syntaxManager: {
            get: function () {}
        },
        file: {
            get: function () {
                return this._file
            }
        },
        model: {
            get: function () {
                return this._model
            }
        }
    })
});
bespin.tiki.module("text_editor:models/textstorage", function (y, s) {
    var v = y("events").Event,
        r = y("bespin:util/util");
    y = function (l) {
        this._lines = l !== null && l !== undefined ? l.split("\n") : [""];this.changed = new v;
        return this
    };
    y.prototype = {
        _lines: null,
        readOnly: false,
        clampPosition: function (l) {
            var h = this._lines,
                d = l.row;
            if (d < 0) return {
                row: 0,
                col: 0
            };
            else if (d >= h.length) return this.range.end;
            l = Math.max(0, Math.min(l.col, h[d].length));
            return {
                row: d,
                col: l
            }
        },
        clampRange: function (l) {
            var h = this.clampPosition(l.start);
            l = this.clampPosition(l.end);
            return {
                start: h,
                end: l
            }
        },
        deleteCharacters: function (l) {
            this.replaceCharacters(l, "")
        },
        displacePosition: function (l, h) {
            var d = h > 0,
                f = this._lines,
                m = f.length;
            for (h = Math.abs(h); h !== 0; h--) if (d) {
                var i = f[l.row].length;
                if (l.row === m - 1 && l.col === i) return l;
                l = l.col === i ? {
                    row: l.row + 1,
                    col: 0
                } : {
                    row: l.row,
                    col: l.col + 1
                }
            } else {
                if (l.row === 0 && l.col == 0) return l;
                if (l.col === 0) {
                    f = this._lines;
                    l = {
                        row: l.row - 1,
                        col: f[l.row - 1].length
                    }
                } else l = {
                    row: l.row,
                    col: l.col - 1
                }
            }
            return l
        },
        getCharacters: function (l) {
            var h = this._lines,
                d = l.start,
                f = l.end,
                m = d.row;
            l = f.row;
            var i = d.col;
            d = f.col;
            if (m === l) return h[m].substring(i, d);
            f = h[m].substring(i);
            m = h.slice(m + 1, l);
            h = h[l].substring(0, d);
            return [f].concat(m, h).join("\n")
        },
        getLines: function () {
            return this._lines
        },
        getRange: function () {
            var l = this._lines,
                h = l.length - 1;
            return {
                start: {
                    row: 0,
                    col: 0
                },
                end: {
                    row: h,
                    col: l[h].length
                }
            }
        },
        getValue: function () {
            return this._lines.join("\n")
        },
        insertCharacters: function (l, h) {
            this.replaceCharacters({
                start: l,
                end: l
            }, h)
        },
        replaceCharacters: function (l, h) {
            if (this.readOnly) throw new Error("Attempt to modify a read-only text storage object");
            var d = h.split("\n"),
                f = d.length,
                m = this.resultingRangeForReplacement(l, d),
                i = l.start,
                g = l.end,
                j = i.row,
                q = g.row,
                t = this._lines;
            d[0] = t[j].substring(0, i.col) + d[0];
            d[f - 1] += t[q].substring(g.col);
            this._lines = r.replace(t, j, q - j + 1, d);
            this.changed(l, m, h)
        },
        resultingRangeForReplacement: function (l, h) {
            var d = h.length;
            l = l.start;
            return {
                start: l,
                end: {
                    row: l.row + d - 1,
                    col: (d === 1 ? l.col : 0) + h[d - 1].length
                }
            }
        },
        setLines: function (l) {
            this.setValue(l.join("\n"))
        },
        setValue: function (l) {
            this.replaceCharacters(this.range, l)
        }
    };
    s.TextStorage =
    y;
    Object.defineProperties(s.TextStorage.prototype, {
        lines: {
            get: function () {
                return this.getLines()
            },
            set: function (l) {
                return this.setLines(l)
            }
        },
        range: {
            get: function () {
                return this.getRange()
            }
        },
        value: {
            get: function () {
                return this.getValue()
            },
            set: function (l) {
                this.setValue(l)
            }
        }
    })
});
bespin.tiki.module("text_editor:utils/rect", function (y, s) {
    s._distanceFromBounds = function (v, r, l) {
        if (v < r) return v - r;
        if (v >= l) return v - l;
        return 0
    };
    s.merge = function (v) {
        var r;
        do {
            r = false;
            for (var l = [], h = 0; h < v.length; h++) {
                var d = v[h];
                l.push(d);
                for (var f = h + 1; f < v.length; f++) {
                    var m = v[f];
                    if (s.rectsSideBySide(d, m) || s.rectsIntersect(d, m)) {
                        v.splice(f, 1);
                        l[l.length - 1] = s.unionRects(d, m);
                        r = true;
                        break
                    }
                }
            }
            v = l
        } while (r);
        return v
    };
    s.offsetFromRect = function (v, r) {
        return {
            x: s._distanceFromBounds(r.x, v.x, s.maxX(v)),
            y: s._distanceFromBounds(r.y, v.y, s.maxY(v))
        }
    };
    s.rectsIntersect = function (v, r) {
        v = s.intersectRects(v, r);
        return v.width !== 0 && v.height !== 0
    };
    s.rectsSideBySide = function (v, r) {
        if (v.x == r.x && v.width == r.width) return v.y < r.y ? v.y + v.height == r.y : r.y + r.height == v.y;
        else if (v.y == r.y && v.height == r.height) return v.x < r.x ? v.x + v.width == r.x : r.x + r.width == v.x;
        return false
    };
    s.intersectRects = function (v, r) {
        v = {
            x: Math.max(s.minX(v), s.minX(r)),
            y: Math.max(s.minY(v), s.minY(r)),
            width: Math.min(s.maxX(v), s.maxX(r)),
            height: Math.min(s.maxY(v), s.maxY(r))
        };
        v.width = Math.max(0, v.width - v.x);
        v.height = Math.max(0, v.height - v.y);
        return v
    };
    s.minX = function (v) {
        return v.x || 0
    };
    s.maxX = function (v) {
        return (v.x || 0) + (v.width || 0)
    };
    s.minY = function (v) {
        return v.y || 0
    };
    s.maxY = function (v) {
        return (v.y || 0) + (v.height || 0)
    };
    s.pointInRect = function (v, r) {
        return v.x >= s.minX(r) && v.y >= s.minY(r) && v.x <= s.maxX(r) && v.y <= s.maxY(r)
    };
    s.unionRects = function (v, r) {
        v = {
            x: Math.min(s.minX(v), s.minX(r)),
            y: Math.min(s.minY(v), s.minY(r)),
            width: Math.max(s.maxX(v), s.maxX(r)),
            height: Math.max(s.maxY(v), s.maxY(r))
        };
        v.width = Math.max(0, v.width - v.x);
        v.height = Math.max(0, v.height - v.y);
        return v
    };
    s.rectsEqual = function (v, r, l) {
        if (!v || !r) return v == r;
        if (!l && l !== 0) l = 0.1;
        if (v.y != r.y && Math.abs(v.y - r.y) > l) return false;
        if (v.x != r.x && Math.abs(v.x - r.x) > l) return false;
        if (v.width != r.width && Math.abs(v.width - r.width) > l) return false;
        if (v.height != r.height && Math.abs(v.height - r.height) > l) return false;
        return true
    }
});
bespin.tiki.module("text_editor:views/canvas", function (y, s) {
    var v = y("bespin:util/util"),
        r = y("utils/rect"),
        l = y("events").Event;
    s.CanvasView = function (h, d, f) {
        if (h) {
            this._preventDownsize = d || false;
            this._clearOnFullInvalid = f || false;
            this._clippingFrame = this._frame = {
                x: 0,
                y: 0,
                width: 0,
                height: 0
            };
            this._invalidRects = [];
            d = document.createElement("canvas");
            d.setAttribute("style", "position: absolute");
            d.innerHTML = "canvas tag not supported by your browser";
            h.appendChild(d);
            this.domNode = d;
            this.clippingChanged = new l;
            this.clippingChanged.add(this.clippingFrameChanged.bind(this))
        }
    };
    s.CanvasView.prototype = {
        domNode: null,
        clippingChanged: null,
        _canvasContext: null,
        _canvasId: null,
        _invalidRects: null,
        _lastRedrawTime: null,
        _redrawTimer: null,
        _clippingFrame: null,
        _preventDownsize: false,
        _clearOnFullInvalid: false,
        _frame: null,
        _getContext: function () {
            if (this._canvasContext === null) this._canvasContext = this.domNode.getContext("2d");
            return this._canvasContext
        },
        computeWithClippingFrame: function (h, d) {
            var f = this.clippingFrame;
            return {
                x: h + f.x,
                y: d + f.y
            }
        },
        minimumRedrawDelay: 1E3 / 30,
        clippingFrameChanged: function () {
            this.invalidate()
        },
        drawRect: function () {},
        render: function () {
            if (!(this._renderTimer || this._redrawTimer)) this._renderTimer = setTimeout(this._tryRedraw.bind(this), 0)
        },
        invalidate: function () {
            this._invalidRects = "all";
            this.render()
        },
        invalidateRect: function (h) {
            var d = this._invalidRects;
            if (d !== "all") {
                d.push(h);
                this.render()
            }
        },
        _tryRedraw: function () {
            this._renderTimer = null;
            var h = (new Date).getTime(),
                d = this._lastRedrawTime,
                f = this.minimumRedrawDelay;
            if (d === null || h - d >= f) this._redraw();
            else if (this._redrawTimer === null) this._redrawTimer = window.setTimeout(this._redraw.bind(this), f)
        },
        _redraw: function () {
            var h = this.clippingFrame;
            h = {
                x: Math.round(h.x),
                y: Math.round(h.y),
                width: h.width,
                height: h.height
            };
            var d = this._getContext();
            d.save();
            d.translate(-h.x, -h.y);
            var f = this._invalidRects;
            if (f === "all") {
                this._clearOnFullInvalid && d.clearRect(0, 0, this.domNode.width, this.domNode.height);
                this.drawRect(h, d)
            } else r.merge(f).forEach(function (m) {
                m = r.intersectRects(m, h);
                if (m.width !== 0 && m.height !== 0) {
                    d.save();
                    var i = m.x,
                        g = m.y,
                        j = m.width,
                        q = m.height;
                    d.beginPath();
                    d.moveTo(i, g);
                    d.lineTo(i + j, g);
                    d.lineTo(i + j, g + q);
                    d.lineTo(i, g + q);
                    d.closePath();
                    d.clip();
                    this.drawRect(m, d);
                    d.restore()
                }
            }, this);
            d.restore();
            this._invalidRects = [];
            this._redrawTimer = null;
            this._lastRedrawTime = (new Date).getTime()
        }
    };
    Object.defineProperties(s.CanvasView.prototype, {
        clippingFrame: {
            get: function () {
                return this._clippingFrame
            },
            set: function (h) {
                h = v.mixin(v.clone(this._clippingFrame), h);
                if (this._clippingFrame === null || !r.rectsEqual(h, this._clippingFrame)) {
                    this._clippingFrame = h;
                    this.clippingChanged()
                }
            }
        },
        frame: {
            get: function () {
                return this._frame
            },
            set: function (h) {
                var d = this.domNode,
                    f = d.style,
                    m = this._preventDownsize,
                    i = d.width,
                    g = d.height;
                f = d.style;
                f.left = h.x + "px";
                f.top = h.y + "px";
                var j, q;
                if (h.width !== i) if (h.width < i) m || (j = true);
                else j = true;
                if (h.height !== g) if (h.height < g) m || (q = true);
                else q = true;
                if (j) this.domNode.width = h.width;
                if (q) this.domNode.height = h.height;
                this._frame = h;
                this.clippingFrame = {
                    width: h.width,
                    height: h.height
                }
            }
        }
    })
});
bespin.tiki.module("text_editor:views/editor", function (y, s) {
    function v(n) {
        var w = C.plugins.text_editor.provides,
            D = w.length,
            J = {};
        if (n) {
            n = n.themestyles;
            if (n.currentThemeVariables && n.currentThemeVariables.text_editor) J = n.currentThemeVariables.text_editor
        }
        for (; D--;) if (w[D].ep === "themevariable") {
            n = h.mixin(h.clone(w[D].defaultValue), J[w[D].name]);
            switch (w[D].name) {
            case "gutter":
            case "editor":
            case "scroller":
            case "highlighter":
                L[w[D].name] = n
            }
        }
    }
    var r = y("rangeutils:utils/range"),
        l = y("views/scroller"),
        h = y("bespin:util/util"),
        d = y("models/buffer").Buffer,
        f = y("completion:controller").CompletionController,
        m = y("controllers/search").EditorSearchController,
        i = y("controllers/undo").EditorUndoController,
        g = y("events").Event,
        j = y("views/gutter").GutterView;
    y("controllers/layoutmanager");
    var q = l.ScrollerCanvasView,
        t = y("views/text").TextView,
        B = y("underscore")._,
        C = y("bespin:plugins").catalog,
        e = y("keyboard:keyboard").keyboardManager,
        K = y("settings").settings,
        L = {};
    v();
    C.registerExtension("themeChange", {
        pointer: v
    });
    s.EditorView = function (n) {
        this.elementAppended =
        new g;
        var w = this.element = this.container = document.createElement("div");
        w.style.overflow = "visible";
        w.style.position = "relative";
        this.scrollOffsetChanged = new g;
        this.willChangeBuffer = new g;
        this.selectionChanged = new g;
        this.textChanged = new g;
        this.gutterView = new j(w, this);
        this.textView = new t(w, this);
        var D = new q(this, l.LAYOUT_VERTICAL),
            J = new q(this, l.LAYOUT_HORIZONTAL);
        this.verticalScroller = D;
        this.horizontalScroller = J;
        this.completionController = new f(this);
        this.editorUndoController = new i(this);
        this.searchController =
        new m(this);
        this._textViewSize = this._oldSize = {
            width: 0,
            height: 0
        };
        this._themeData = L;
        this.buffer = new d(null, n);
        this.elementAppended.add(function () {
            var Q = K.get("fontsize"),
                Z = K.get("fontface");
            this._font = Q + "px " + Z;
            C.registerExtension("themeChange", {
                pointer: this._themeVariableChange.bind(this)
            });
            C.registerExtension("settingChange", {
                match: "font[size|face]",
                pointer: this._fontSettingChanged.bind(this)
            });
            C.registerExtension("dimensionsChanged", {
                pointer: this.dimensionsChanged.bind(this)
            });
            this._dontRecomputeLayout =
            false;
            this._recomputeLayout();
            w.addEventListener(h.isMozilla ? "DOMMouseScroll" : "mousewheel",
            this._onMouseWheel.bind(this),
            false);
            D.valueChanged.add(function (T) {
                this.scrollOffset = {
                    y: T
                }
            }.bind(this));
            J.valueChanged.add(function (T) {
                this.scrollOffset = {
                    x: T
                }
            }.bind(this));
            this.scrollOffsetChanged.add(function (T) {
                this._updateScrollOffsetChanged(T)
            }.bind(this))
        }.bind(this))
    };
    s.EditorView.prototype = {
        elementAppended: null,
        textChanged: null,
        selectionChanged: null,
        scrollOffsetChanged: null,
        willChangeBuffer: null,
        _textViewSize: null,
        _textLinesCount: 0,
        _gutterViewWidth: 0,
        _oldSize: null,
        _buffer: null,
        _dontRecomputeLayout: true,
        _themeData: null,
        _layoutManagerSizeChanged: function (n) {
            var w = this.layoutManager.fontDimension;
            this._textViewSize = {
                width: n.width * w.characterWidth,
                height: n.height * w.lineHeight
            };
            if (this._textLinesCount !== n.height) {
                this.gutterView.computeWidth() !== this._gutterViewWidth ? this._recomputeLayout(true) : this.gutterView.invalidate();this._textLinesLength = n.height
            }
            this._updateScrollers();
            this.scrollOffset = {}
        },
        _updateScrollers: function () {
            if (!this._dontRecomputeLayout) {
                var n =
                this.textViewPaddingFrame,
                    w = this._textViewSize.width,
                    D = this._textViewSize.height,
                    J = this.scrollOffset,
                    Q = this.verticalScroller,
                    Z = this.horizontalScroller;
                if (D < n.height) Q.isVisible = false;
                else {
                    Q.isVisible = true;
                    Q.proportion = n.height / D;
                    Q.maximum = D - n.height;
                    Q.value = J.y
                }
                if (w < n.width) Z.isVisible = false;
                else {
                    Z.isVisible = true;
                    Z.proportion = n.width / w;
                    Z.maximum = w - n.width;
                    Z.value = J.x
                }
            }
        },
        _onMouseWheel: function (n) {
            var w = 0;
            if (n.wheelDelta) w = -n.wheelDelta;
            else if (n.detail) w = n.detail * 40;
            var D = true;
            if (n.axis) {
                if (n.axis == n.HORIZONTAL_AXIS) D = false
            } else if (n.wheelDeltaY || n.wheelDeltaX) {
                if (n.wheelDeltaX == n.wheelDelta) D = false
            } else if (n.shiftKey) D = false;
            D ? this.scrollBy(0, w) : this.scrollBy(w * 5, 0);h.stopEvent(n)
        },
        scrollTo: function (n) {
            this.scrollOffset = n
        },
        scrollBy: function (n, w) {
            this.scrollOffset = {
                x: this.scrollOffset.x + n,
                y: this.scrollOffset.y + w
            }
        },
        _recomputeLayout: function (n) {
            if (!this._dontRecomputeLayout) {
                var w = this.container.offsetWidth,
                    D = this.container.offsetHeight;
                if (!(!n && w == this._oldSize.width && D == this._oldSize.height)) {
                    this._oldSize = {
                        width: w,
                        height: D
                    };
                    this._gutterViewWidth = n = this.gutterView.computeWidth();
                    this.gutterView.frame = {
                        x: 0,
                        y: 0,
                        width: n,
                        height: D
                    };
                    this.textView.frame = {
                        x: n,
                        y: 0,
                        width: w - n,
                        height: D
                    };
                    var J = this._themeData.scroller.padding,
                        Q = this._themeData.scroller.thickness;
                    this.horizontalScroller.frame = {
                        x: n + J,
                        y: D - (Q + J),
                        width: w - (n + 2 * J + Q),
                        height: Q
                    };
                    this.verticalScroller.frame = {
                        x: w - (J + Q),
                        y: J,
                        width: Q,
                        height: D - (2 * J + Q)
                    };
                    this.scrollOffset = {};
                    this._updateScrollers();
                    this.gutterView.invalidate();
                    this.textView.invalidate();
                    this.verticalScroller.invalidate();
                    this.horizontalScroller.invalidate()
                }
            }
        },
        dimensionsChanged: function () {
            this._recomputeLayout()
        },
        _font: null,
        _fontSettingChanged: function () {
            var n = K.get("fontsize"),
                w = K.get("fontface");
            this._font = n + "px " + w;
            this.layoutManager._recalculateMaximumWidth();
            this._layoutManagerSizeChanged(this.layoutManager.size);
            this.textView.invalidate()
        },
        _themeVariableChange: function () {
            this._recomputeLayout(true)
        },
        _updateScrollOffsetChanged: function (n) {
            this.verticalScroller.value = n.y;
            this.horizontalScroller.value = n.x;
            this.textView.clippingFrame = {
                x: n.x,
                y: n.y
            };
            this.gutterView.clippingFrame = {
                y: n.y
            };
            this._updateScrollers();
            this.gutterView.invalidate();
            this.textView.invalidate()
        },
        processKeyEvent: function (n, w, D) {
            D = B(D).clone();
            D.completing = this.completionController.isCompleting();
            return e.processKeyEvent(n, w, D)
        },
        convertTextViewPoint: function (n) {
            var w = this.scrollOffset;
            return {
                x: n.x - w.x + this._gutterViewWidth,
                y: n.y - w.y
            }
        },
        replace: function (n, w, D) {
            if (!r.isRange(n)) throw new Error('replace(): expected range but found "' + n + "'");
            if (!h.isString(w)) throw new Error('replace(): expected text string but found "' + text + '"');
            var J = r.normalizeRange(n),
                Q = this.textView,
                Z = Q.getSelectedRange(false);
            return Q.groupChanges(function () {
                Q.replaceCharacters(J, w);
                if (D) Q.setSelection(Z);
                else {
                    var T = w.split("\n");
                    T = T.length > 1 ? {
                        row: n.start.row + T.length - 1,
                        col: T[T.length - 1].length
                    } : r.addPositions(n.start, {
                        row: 0,
                        col: w.length
                    });Q.moveCursorTo(T)
                }
            })
        },
        getText: function (n) {
            if (!r.isRange(n)) throw new Error('getText(): expected range but found "' + n + '"');
            return this.layoutManager.textStorage.getCharacters(r.normalizeRange(n))
        },
        setLineNumber: function (n) {
            if (!h.isNumber(n)) throw new Error("setLineNumber(): lineNumber must be a number");
            this.textView.moveCursorTo({
                row: n - 1,
                col: 0
            })
        },
        setCursor: function (n) {
            if (!r.isPosition(n)) throw new Error('setCursor(): expected position but found "' + n + '"');
            this.textView.moveCursorTo(n)
        },
        changeGroup: function (n) {
            return this.textView.groupChanges(function () {
                n(this)
            }.bind(this))
        },
        addTags: function (n) {
            this.completionController.tags.add(n)
        }
    };
    Object.defineProperties(s.EditorView.prototype, {
        themeData: {
            get: function () {
                return this._themeData
            },
            set: function () {
                throw new Error("themeData can't be changed directly. Use themeManager.");
            }
        },
        font: {
            get: function () {
                return this._font
            },
            set: function () {
                throw new Error("font can't be changed directly. Use settings fontsize and fontface.");
            }
        },
        buffer: {
            set: function (n) {
                if (n !== this._buffer) {
                    if (!n.loadPromise.isResolved()) throw new Error("buffer.set(): the new buffer must first be loaded!");
                    if (this._buffer !== null) {
                        this.layoutManager.sizeChanged.remove(this);
                        this.layoutManager.textStorage.changed.remove(this);
                        this.textView.selectionChanged.remove(this)
                    }
                    this.willChangeBuffer(n);
                    C.publish(this, "editorChange", "buffer", n);
                    this.layoutManager = n.layoutManager;
                    this._buffer = n;
                    var w = this.layoutManager,
                        D = this.textView;
                    w.sizeChanged.add(this, this._layoutManagerSizeChanged.bind(this));
                    w.textStorage.changed.add(this, this.textChanged.bind(this));
                    D.selectionChanged.add(this, this.selectionChanged.bind(this));
                    this.textView.setSelection(n._selectedRange, false);
                    this.scrollOffsetChanged(n._scrollOffset);
                    this.layoutManager.sizeChanged(this.layoutManager.size);
                    this._recomputeLayout()
                }
            },
            get: function () {
                return this._buffer
            }
        },
        frame: {
            get: function () {
                return {
                    width: this.container.offsetWidth,
                    height: this.container.offsetHeight
                }
            }
        },
        textViewPaddingFrame: {
            get: function () {
                var n = h.clone(this.textView.frame),
                    w = this.textView.padding;
                n.width -= w.left + w.right;
                n.height -= w.top + w.bottom;
                return n
            }
        },
        scrollOffset: {
            set: function (n) {
                if (n.x === undefined) n.x = this.scrollOffset.x;
                if (n.y === undefined) n.y = this.scrollOffset.y;
                var w = this.textViewPaddingFrame;
                if (n.y < 0) n.y = 0;
                else if (this._textViewSize.height < w.height) n.y = 0;
                else if (n.y + w.height > this._textViewSize.height) n.y = this._textViewSize.height - w.height;
                if (n.x < 0) n.x = 0;
                else if (this._textViewSize.width < w.width) n.x = 0;
                else if (n.x + w.width > this._textViewSize.width) n.x = this._textViewSize.width - w.width;
                if (!(n.x === this.scrollOffset.x && n.y === this.scrollOffset.y)) {
                    this.buffer._scrollOffset = n;
                    this.scrollOffsetChanged(n);
                    C.publish(this, "editorChange", "scrollOffset", n)
                }
            },
            get: function () {
                return this.buffer._scrollOffset
            }
        },
        readOnly: {
            get: function () {
                return this._buffer.model.readOnly
            },
            set: function (n) {
                this._buffer.model.readOnly = n
            }
        },
        focus: {
            get: function () {
                return this.textView.hasFocus
            },
            set: function (n) {
                if (!h.isBoolean(n)) throw new Error('set focus: expected boolean but found "' + n + '"');
                this.textView.hasFocus = n
            }
        },
        selection: {
            get: function () {
                return h.clone(this.textView.getSelectedRange(false))
            },
            set: function (n) {
                if (!r.isRange(n)) throw new Error("set selection: position/selection must be supplied");
                this.textView.setSelection(n)
            }
        },
        selectedText: {
            get: function () {
                return this.getText(this.selection)
            },
            set: function (n) {
                if (!h.isString(n)) throw new Error('set selectedText: expected string but found "' + n + '"');
                return this.replace(this.selection, n)
            }
        },
        value: {
            get: function () {
                return this.layoutManager.textStorage.value
            },
            set: function (n) {
                if (!h.isString(n)) throw new Error('set value: expected string but found "' + n + '"');
                return this.replace(this.layoutManager.textStorage.range, n, false)
            }
        },
        syntax: {
            get: function () {
                return this.layoutManager.syntaxManager.getSyntax()
            },
            set: function (n) {
                if (!h.isString(n)) throw new Error('set syntax: expected string but found "' + newValue + '"');
                return this.layoutManager.syntaxManager.setSyntax(n)
            }
        }
    })
});
bespin.tiki.module("text_editor:views/gutter", function (y, s) {
    var v = y("bespin:util/util"),
        r = y("views/canvas").CanvasView;
    s.GutterView = function (l, h) {
        r.call(this, l, true);
        this.editor = h
    };
    s.GutterView.prototype = new r;
    v.mixin(s.GutterView.prototype, {
        drawRect: function (l, h) {
            var d = this.editor.themeData.gutter;
            h.fillStyle = d.backgroundColor;
            h.fillRect(l.x, l.y, l.width, l.height);
            h.save();
            h.translate(d.paddingLeft, 0);
            var f = this.editor.layoutManager,
                m = f.characterRangeForBoundingRect(l);
            l = Math.min(m.end.row, f.textLines.length - 1);
            var i = f.fontDimension.lineAscent;
            h.fillStyle = d.color;
            h.font = this.editor.font;
            for (d = m.start.row; d <= l; d++) h.fillText("" + (d + 1), -0.5, f.lineRectForRow(d).y + i - 0.5);
            h.restore()
        },
        computeWidth: function () {
            var l = this.editor.themeData.gutter,
                h = this.editor.layoutManager;
            return h.fontDimension.characterWidth * ("" + h.textLines.length).length + (l.paddingLeft + l.paddingRight)
        }
    })
});
bespin.tiki.module("text_editor:views/scroller", function (y, s) {
    var v = y("bespin:util/util"),
        r = y("events").Event,
        l = y("bespin:console").console,
        h = y("utils/rect"),
        d = y("views/canvas").CanvasView,
        f = s.LAYOUT_HORIZONTAL = 0,
        m = s.LAYOUT_VERTICAL = 1;
    s.ScrollerCanvasView = function (i, g) {
        d.call(this, i.container, false, true);
        this.editor = i;
        this.layoutDirection = g;
        i = function (j, q, t) {
            t = t || this.domNode;
            t.addEventListener(j, function (B) {
                q.call(this, B);
                v.stopEvent(B)
            }.bind(this), false)
        }.bind(this);
        i("mouseover", this.mouseEntered);
        i("mouseout", this.mouseExited);
        i("mousedown", this.mouseDown);
        i("mouseup", this.mouseUp, window);
        i("mousemove", this.mouseMove, window);
        this.valueChanged = new r
    };
    s.ScrollerCanvasView.prototype = new d;
    v.mixin(s.ScrollerCanvasView.prototype, {
        lineHeight: 20,
        proportion: 0,
        layoutDirection: m,
        _isVisible: false,
        _maximum: 0,
        _value: 0,
        valueChanged: null,
        padding: {
            left: 0,
            bottom: 0,
            top: 0,
            right: 0
        },
        _mouseDownScreenPoint: null,
        _mouseDownValue: null,
        _isMouseOver: false,
        _scrollTimer: null,
        _mouseEventPosition: null,
        _mouseOverHandle: false,
        _drawNib: function (i) {
            var g = this.editor.themeData.scroller,
                j, q;
            j = g.nibStyle;
            q = g.nibArrowStyle;
            g = g.nibStrokeStyle;
            var t = Math.floor(7.5);
            i.fillStyle = j;
            i.beginPath();
            i.arc(0, 0, Math.floor(7.5), 0, Math.PI * 2, true);
            i.closePath();
            i.fill();
            i.strokeStyle = g;
            i.stroke();
            i.fillStyle = q;
            i.beginPath();
            i.moveTo(0, -t + 3);
            i.lineTo(-t + 3, t - 5);
            i.lineTo(t - 3, t - 5);
            i.closePath();
            i.fill()
        },
        _drawNibs: function (i, g) {
            var j = this._getClientThickness(),
                q = this._value,
                t = this._maximum,
                B = this._isHighlighted();
            if (B || q !== 0) {
                i.save();
                i.translate(8, j / 2);
                i.rotate(Math.PI * 1.5);
                i.moveTo(0, 0);
                this._drawNib(i, g);
                i.restore()
            }
            if (B || q !== t) {
                i.save();
                i.translate(this._getClientLength() - 8, j / 2);
                i.rotate(Math.PI * 0.5);
                i.moveTo(0, 0);
                this._drawNib(i, g);
                i.restore()
            }
        },
        _getClientFrame: function () {
            var i = this.frame,
                g = this.padding;
            return {
                x: g.left,
                y: g.top,
                width: i.width - (g.left + g.right),
                height: i.height - (g.top + g.bottom)
            }
        },
        _getClientLength: function () {
            var i = this._getClientFrame();
            switch (this.layoutDirection) {
            case f:
                return i.width;
            case m:
                return i.height;
            default:
                l.error("unknown layout direction");
                return null
            }
        },
        _getClientThickness: function () {
            var i = this.padding,
                g = this.editor.themeData.scroller.thickness;
            switch (this.layoutDirection) {
            case m:
                return g - (i.left + i.right);
            case f:
                return g - (i.top + i.bottom);
            default:
                l.error("unknown layout direction");
                return null
            }
        },
        _getFrameLength: function () {
            switch (this.layoutDirection) {
            case f:
                return this.frame.width;
            case m:
                return this.frame.height;
            default:
                l.error("unknown layout direction");
                return null
            }
        },
        _getGutterFrame: function () {
            var i = this._getClientFrame(),
                g = this._getClientThickness();
            switch (this.layoutDirection) {
            case m:
                return {
                    x: i.x,
                    y: i.y + 15,
                    width: g,
                    height: Math.max(0, i.height - 30)
                };
            case f:
                return {
                    x: i.x + 15,
                    y: i.y,
                    width: Math.max(0, i.width - 30),
                    height: g
                };
            default:
                l.error("unknown layout direction");
                return null
            }
        },
        _getGutterLength: function () {
            var i = this._getGutterFrame(),
                g;
            switch (this.layoutDirection) {
            case f:
                g = i.width;
                break;
            case m:
                g = i.height;
                break;
            default:
                l.error("unknown layout direction");
                break
            }
            return g
        },
        _getHandleFrame: function () {
            var i = this._getGutterFrame(),
                g = this._getHandleOffset(),
                j = this._getHandleLength();
            switch (this.layoutDirection) {
            case m:
                return {
                    x: i.x,
                    y: i.y + g,
                    width: i.width,
                    height: j
                };
            case f:
                return {
                    x: i.x + g,
                    y: i.y,
                    width: j,
                    height: i.height
                }
            }
        },
        _getHandleLength: function () {
            var i = this._getGutterLength();
            return Math.max(i * this.proportion, 20)
        },
        _getHandleOffset: function () {
            var i = this._maximum;
            if (i === 0) return 0;
            var g = this._getGutterLength(),
                j = this._getHandleLength();
            return (g - j) * this._value / i
        },
        _isHighlighted: function () {
            return this._isMouseOver === true || this._mouseDownScreenPoint !== null
        },
        _segmentForMouseEvent: function (i) {
            i = {
                x: i.layerX,
                y: i.layerY
            };
            var g = this._getClientFrame(),
                j = this.padding;
            if (!h.pointInRect(i, g)) return null;
            var q = this.layoutDirection;
            switch (q) {
            case f:
                if (i.x - j.left < 15) return "nib-start";
                else if (i.x >= g.width - 15) return "nib-end";
                break;
            case m:
                if (i.y - j.top < 15) return "nib-start";
                else if (i.y >= g.height - 15) return "nib-end";
                break;
            default:
                l.error("unknown layout direction");
                break
            }
            j = this._getHandleFrame();
            if (h.pointInRect(i, j)) return "handle";
            switch (q) {
            case f:
                if (i.x < j.x) return "gutter-before";
                else if (i.x >= j.x + j.width) return "gutter-after";
                break;
            case m:
                if (i.y < j.y) return "gutter-before";
                else if (i.y >= j.y + j.height) return "gutter-after";
                break;
            default:
                l.error("unknown layout direction");
                break
            }
            l.error("_segmentForMouseEvent: point ", i, " outside view with handle frame ", j, " and client frame ", g);
            return null
        },
        adjustFrame: function () {
            var i = this.frame;
            this.set("layout", {
                left: 0,
                top: 0,
                width: i.width,
                height: i.height
            })
        },
        drawRect: function (i, g) {
            if (this._isVisible) {
                var j = this._isHighlighted();
                i = this.editor.themeData.scroller;
                var q = j ? i.fullAlpha : i.particalAlpha,
                    t = this.frame;g.clearRect(0, 0, t.width, t.height);g.save();t = this.padding;g.translate(t.left, t.top);this._getHandleFrame();t = this._getGutterLength();
                var B = this._getClientThickness(),
                    C = B / 2,
                    e = this.layoutDirection,
                    K = this._getHandleOffset() + 15,
                    L = this._getHandleLength();
                if (e === m) {
                    g.translate(B + 1, 0);
                    g.rotate(Math.PI * 0.5)
                }
                if (!(t <= L)) {
                    g.globalAlpha = q;
                    if (j) {
                        j = this._getClientLength();
                        g.fillStyle = i.trackFillStyle;
                        g.fillRect(8.5, 0.5, j - 16, B - 1);
                        g.strokeStyle = i.trackStrokeStyle;
                        g.strokeRect(8.5, 0.5, j - 16, B - 1)
                    }
                    j = function () {
                        g.beginPath();
                        g.arc(K + C + 0.5, C, C - 0.5, Math.PI / 2, 3 * Math.PI / 2, false);
                        g.arc(K + L - C - 0.5, C, C - 0.5, 3 * Math.PI / 2, Math.PI / 2, false);
                        g.lineTo(K + C + 0.5, B - 0.5);
                        g.closePath()
                    };
                    j();
                    t = g.createLinearGradient(K, 0, K, B);
                    t.addColorStop(0, i.barFillGradientTopStart);
                    t.addColorStop(0.4, i.barFillGradientTopStop);
                    t.addColorStop(0.41, i.barFillStyle);
                    t.addColorStop(0.8, i.barFillGradientBottomStart);
                    t.addColorStop(1, i.barFillGradientBottomStop);
                    g.fillStyle = t;
                    g.fill();
                    g.save();
                    g.clip();
                    g.fillStyle =
                    i.barFillStyle;
                    g.beginPath();
                    g.moveTo(K + C * 0.4, C * 0.6);
                    g.lineTo(K + C * 0.9, B * 0.4);
                    g.lineTo(K, B * 0.4);
                    g.closePath();
                    g.fill();
                    g.beginPath();
                    g.moveTo(K + L - C * 0.4, 0 + C * 0.6);
                    g.lineTo(K + L - C * 0.9, 0 + B * 0.4);
                    g.lineTo(K + L, 0 + B * 0.4);
                    g.closePath();
                    g.fill();
                    g.restore();
                    g.save();
                    j();
                    g.strokeStyle = i.trackStrokeStyle;
                    g.stroke();
                    g.restore();
                    this._drawNibs(g, q);
                    g.restore()
                }
            }
        },
        _repeatAction: function (i, g) {
            if (i() !== false) {
                var j = function () {
                    this._repeatAction(i, 100)
                }.bind(this);
                this._scrollTimer = setTimeout(j, g)
            }
        },
        _scrollByDelta: function (i) {
            this.value =
            this._value + i
        },
        _scrollUpOneLine: function () {
            this._scrollByDelta(-this.lineHeight);
            return true
        },
        _scrollDownOneLine: function () {
            this._scrollByDelta(this.lineHeight);
            return true
        },
        _scrollPage: function () {
            switch (this._segmentForMouseEvent(this._mouseEventPosition)) {
            case "gutter-before":
                this._scrollByDelta(this._getGutterLength() * -1);
                break;
            case "gutter-after":
                this._scrollByDelta(this._getGutterLength());
                break;
            case null:
                break;
            default:
                return false
            }
            return true
        },
        mouseDown: function (i) {
            this._mouseEventPosition =
            i;
            this._mouseOverHandle = false;
            this._getGutterLength();
            switch (this._segmentForMouseEvent(i)) {
            case "nib-start":
                this._repeatAction(this._scrollUpOneLine.bind(this), 500);
                break;
            case "nib-end":
                this._repeatAction(this._scrollDownOneLine.bind(this), 500);
                break;
            case "gutter-before":
                this._repeatAction(this._scrollPage.bind(this), 500);
                break;
            case "gutter-after":
                this._repeatAction(this._scrollPage.bind(this), 500);
                break;
            case "handle":
                break;
            default:
                l.error("_segmentForMouseEvent returned an unknown value");
                break
            }
            switch (this.layoutDirection) {
            case f:
                this._mouseDownScreenPoint =
                i.pageX;
                break;
            case m:
                this._mouseDownScreenPoint = i.pageY;
                break;
            default:
                l.error("unknown layout direction");
                break
            }
        },
        mouseMove: function (i) {
            if (this._mouseDownScreenPoint !== null) {
                if (this._segmentForMouseEvent(i) == "handle" || this._mouseOverHandle === true) {
                    this._mouseOverHandle = true;
                    if (this._scrollTimer !== null) {
                        clearTimeout(this._scrollTimer);
                        this._scrollTimer = null
                    }
                    var g;
                    switch (this.layoutDirection) {
                    case f:
                        g = i.pageX;
                        break;
                    case m:
                        g = i.pageY;
                        break;
                    default:
                        l.error("unknown layout direction");
                        break
                    }
                    var j = g - this._mouseDownScreenPoint,
                        q = this._maximum,
                        t = this._value,
                        B = this._getGutterLength(),
                        C = this._getHandleLength();
                    this.value = t + q * j / (B - C);
                    this._mouseDownScreenPoint = g
                }
                this._mouseEventPosition = i
            }
        },
        mouseEntered: function () {
            this._isMouseOver = true;
            this.invalidate()
        },
        mouseExited: function () {
            this._isMouseOver = false;
            this.invalidate()
        },
        mouseUp: function () {
            this._mouseDownValue = this._mouseDownScreenPoint = null;
            if (this._scrollTimer) {
                clearTimeout(this._scrollTimer);
                this._scrollTimer = null
            }
            this.invalidate()
        }
    });
    Object.defineProperties(s.ScrollerCanvasView.prototype, {
        isVisible: {
            set: function (i) {
                if (this._isVisible !== i) {
                    this._isVisible = i;
                    this.domNode.style.display = i ? "block" : "none";i && this.invalidate()
                }
            }
        },
        maximum: {
            set: function (i) {
                if (this._value > this._maximum) this._value = this._maximum;
                if (i !== this._maximum) {
                    this._maximum = i;
                    this.invalidate()
                }
            }
        },
        value: {
            set: function (i) {
                if (i < 0) i = 0;
                else if (i > this._maximum) i = this._maximum;
                if (i !== this._value) {
                    this._value = i;
                    this.valueChanged(i);
                    this.invalidate()
                }
            }
        }
    })
});
bespin.tiki.module("text_editor:views/text", function (y, s) {
    var v = y("bespin:plugins").catalog,
        r = y("bespin:util/util"),
        l = y("events").Event,
        h = y("views/canvas").CanvasView;
    y("controllers/layoutmanager");
    var d = y("rangeutils:utils/range"),
        f = y("utils/rect"),
        m = y("views/textinput").TextInput,
        i = y("bespin:console").console,
        g = y("settings").settings;
    s.TextView = function (j, q) {
        h.call(this, j, true);
        this.editor = q;
        this.textInput = new m(j, this);
        this.padding = {
            top: 0,
            bottom: 30,
            left: 0,
            right: 30
        };
        this.clippingChanged.add(this.clippingFrameChanged.bind(this));
        j = this.domNode;
        j.style.cursor = "text";
        j.addEventListener("mousedown", this.mouseDown.bind(this), false);
        j.addEventListener("mousemove", this.mouseMove.bind(this), false);
        window.addEventListener("mouseup", this.mouseUp.bind(this), false);
        q.willChangeBuffer.add(this.editorWillChangeBuffer.bind(this));
        this.selectionChanged = new l;
        this.beganChangeGroup = new l;
        this.endedChangeGroup = new l;
        this.willReplaceRange = new l;
        this.replacedCharacters = new l
    };
    s.TextView.prototype = new h;
    r.mixin(s.TextView.prototype, {
        _dragPoint: null,
        _dragTimer: null,
        _enclosingScrollView: null,
        _inChangeGroup: false,
        _insertionPointBlinkTimer: null,
        _insertionPointVisible: true,
        _keyBuffer: "",
        _keyMetaBuffer: "",
        _keyState: "start",
        _hasFocus: false,
        _mouseIsDown: false,
        selectionChanged: null,
        beganChangeGroup: null,
        endedChangeGroup: null,
        willReplaceRange: null,
        replacedCharacters: null,
        editorWillChangeBuffer: function (j) {
            if (this.editor.layoutManager) {
                var q = this.editor.layoutManager;
                q.invalidatedRects.remove(this);
                q.changedTextAtRow.remove(this)
            }
            q = j.layoutManager;
            q.invalidatedRects.add(this, this.layoutManagerInvalidatedRects.bind(this));
            q.changedTextAtRow.add(this, this.layoutManagerChangedTextAtRow.bind(this))
        },
        didFocus: function () {
            this._setFocus(true, true)
        },
        didBlur: function () {
            this._setFocus(false, true)
        },
        _drag: function () {
            var j = this._dragPoint,
                q = f.offsetFromRect(this.clippingFrame, j);
            this.moveCursorTo(this._selectionPositionForPoint({
                x: j.x - q.x,
                y: j.y - q.y
            }), true)
        },
        _drawInsertionPoint: function (j, q) {
            if (this._insertionPointVisible) {
                var t = this.editor.layoutManager.characterRectForPosition(this.editor.buffer._selectedRange.start);
                j = Math.floor(t.x);
                var B = t.y,
                    C = Math.ceil(t.width);
                t = t.height;
                q.save();
                var e = this.editor.themeData.editor;
                if (this._hasFocus) {
                    q.strokeStyle = e.cursorColor;
                    q.beginPath();
                    q.moveTo(j + 0.5, B);
                    q.lineTo(j + 0.5, B + t);
                    q.closePath();
                    q.stroke()
                } else {
                    q.fillStyle = e.unfocusedCursorBackgroundColor;
                    q.fillRect(j + 0.5, B, C - 0.5, t);
                    q.strokeStyle = e.unfocusedCursorColor;
                    q.strokeRect(j + 0.5, B + 0.5, C - 1, t - 1)
                }
                q.restore()
            }
        },
        _drawLines: function (j, q) {
            var t = this.editor.layoutManager,
                B = t.textLines,
                C = t.fontDimension.lineAscent,
                e = this.editor.themeData.highlighter;
            q.save();
            q.font = this.editor.font;
            var K = t.characterRangeForBoundingRect(j),
                L = K.start;
            K = K.end;
            for (var n = K.row, w = L.row; w <= n; w++) {
                var D = B[w];
                if (!r.none(D)) {
                    var J = D.characters,
                        Q = J.length,
                        Z = Math.min(K.col, Q),
                        T = L.col;
                    if (!(T >= Q)) {
                        D = D.colors;
                        if (D == null) D = [];
                        for (Q = 0; Q < D.length && T < D[Q].start;) Q++;
                        for (var ca = Q < D.length ? D[Q].start : T;ca < Z;) {
                            j = D[Q];
                            T = j != null ? j.end : Z;j = j != null ? j.tag : "plain";j = e.hasOwnProperty(j) ? e[j] : "red";q.fillStyle = j;j = t.characterRectForPosition({
                                row: w,
                                col: ca
                            });ca = J.substring(ca, T);q.fillText(ca, j.x, j.y + C);ca = T;Q++
                        }
                    }
                }
            }
            q.restore()
        },
        _drawSelectionHighlight: function (j, q) {
            j = this.editor.themeData.editor;
            j = this._hasFocus ? j.selectedTextBackgroundColor : j.unfocusedCursorBackgroundColor;
            var t = this.editor.layoutManager;q.save();
            var B = d.normalizeRange(this.editor.buffer._selectedRange);q.fillStyle = j;t.rectsForRange(B).forEach(function (C) {
                q.fillRect(C.x, C.y, C.width, C.height)
            });q.restore()
        },
        _drawSelection: function (j, q) {
            this._rangeIsInsertionPoint(this.editor.buffer._selectedRange) ? this._drawInsertionPoint(j, q) : this._drawSelectionHighlight(j, q)
        },
        _getVirtualSelection: function (j) {
            var q = this.editor.buffer._selectedRange,
                t = this.editor.buffer._selectedRangeEndVirtual;
            return {
                start: j && t ? t : q.start,
                end: t || q.end
            }
        },
        _invalidateSelection: function () {
            var j = function (B) {
                return {
                    x: B.x - 1,
                    y: B.y,
                    width: B.width + 2,
                    height: B.height
                }
            },
                q = this.editor.layoutManager,
                t = d.normalizeRange(this.editor.buffer._selectedRange);
            if (this._rangeIsInsertionPoint(t)) {
                q = q.characterRectForPosition(t.start);
                this.invalidateRect(j(q))
            } else q.rectsForRange(t).forEach(function (B) {
                this.invalidateRect(j(B))
            }, this)
        },
        _isReadOnly: function () {
            return this.editor.layoutManager.textStorage.readOnly
        },
        _keymappingChanged: function () {
            this._keyBuffer = "";
            this._keyState = "start"
        },
        _performVerticalKeyboardSelection: function (j) {
            var q = this.editor.buffer._selectedRangeEndVirtual;
            this.moveCursorTo(d.addPositions(q !== null ? q : this.editor.buffer._selectedRange.end,
            {
                row: j,
                col: 0
            }), true, true)
        },
        _rangeIsInsertionPoint: function (j) {
            return d.isZeroLength(j)
        },
        _rearmInsertionPointBlinkTimer: function () {
            this._insertionPointVisible || this.blinkInsertionPoint();
            this._insertionPointBlinkTimer !== null && clearInterval(this._insertionPointBlinkTimer);
            this._insertionPointBlinkTimer = setInterval(this.blinkInsertionPoint.bind(this), 750)
        },
        _repositionSelection: function () {
            var j = this.editor.layoutManager.textLines,
                q = j.length,
                t = this.editor.buffer._selectedRange,
                B = Math.min(t.start.row, q - 1);
            q = Math.min(t.end.row, q - 1);
            var C = j[q];
            this.setSelection({
                start: {
                    row: B,
                    col: Math.min(t.start.col, j[B].characters.length)
                },
                end: {
                    row: q,
                    col: Math.min(t.end.col, C.characters.length)
                }
            })
        },
        _scrollPage: function (j) {
            this.editor.scrollBy(0, (this.clippingFrame.height + this.editor.layoutManager.fontDimension.lineAscent) * (j ? -1 : 1))
        },
        _scrollWhileDragging: function () {
            var j = this._dragPoint;
            j = this.computeWithClippingFrame(j.layerX, j.layerY);
            r.mixin(this._dragPoint, j);
            this._drag()
        },
        _selectionPositionForPoint: function (j) {
            j = this.editor.layoutManager.characterAtPoint(j);
            return j.partialFraction < 0.5 ? j : d.addPositions(j, {
                row: 0,
                col: 1
            })
        },
        _syntaxManagerUpdatedSyntaxForRows: function (j, q) {
            if (j !== q) {
                var t = this.editor.layoutManager;
                t.updateTextRows(j, q);
                t.rectsForRange({
                    start: {
                        row: j,
                        col: 0
                    },
                    end: {
                        row: q,
                        col: 0
                    }
                }).forEach(this.invalidateRect, this)
            }
        },
        blinkInsertionPoint: function () {
            this._insertionPointVisible = !this._insertionPointVisible;
            this._invalidateSelection()
        },
        copy: function () {
            return this.getSelectedCharacters()
        },
        cut: function () {
            var j = this.getSelectedCharacters();
            j != "" && this.performBackspaceOrDelete(false);
            return j
        },
        drawRect: function (j, q) {
            q.fillStyle = this.editor.themeData.editor.backgroundColor;
            q.fillRect(j.x, j.y, j.width, j.height);
            this._drawSelection(j, q);
            this._drawLines(j, q)
        },
        focus: function () {
            this.textInput.focus()
        },
        getInsertionPointPosition: function () {
            var j = this.editor;
            j = j.layoutManager.characterRectForPosition(j.buffer._selectedRange.start);
            return {
                x: j.x,
                y: j.y
            }
        },
        getSelectedCharacters: function () {
            return this._rangeIsInsertionPoint(this.editor.buffer._selectedRange) ? "" : this.editor.layoutManager.textStorage.getCharacters(d.normalizeRange(this.editor.buffer._selectedRange))
        },
        getSelectedRange: function (j) {
            return j ? this.editor.buffer._selectedRange : d.normalizeRange(this.editor.buffer._selectedRange)
        },
        groupChanges: function (j) {
            if (this._isReadOnly()) return false;
            if (this._inChangeGroup) {
                j();
                return true
            }
            this._inChangeGroup = true;
            this.beganChangeGroup(this, this.editor.buffer._selectedRange);
            try {
                j()
            } catch (q) {
                i.error("Error in groupChanges(): " + q);
                this._inChangeGroup = false;
                this.endedChangeGroup(this, this.editor.buffer._selectedRange);
                return false
            } finally {
                this._inChangeGroup = false;
                this.endedChangeGroup(this, this.editor.buffer._selectedRange);
                return true
            }
        },
        insertText: function (j) {
            if (this._isReadOnly()) return false;
            this.groupChanges(function () {
                var q = d.normalizeRange(this.editor.buffer._selectedRange);
                this.replaceCharacters(q, j);
                var t = j.split("\n");
                this.moveCursorTo(t.length > 1 ? {
                    row: q.start.row + t.length - 1,
                    col: t[t.length - 1].length
                } : d.addPositions(q.start, {
                    row: 0,
                    col: j.length
                }))
            }.bind(this));
            return true
        },
        isDelimiter: function (j) {
            return "\"',;.!~@#$%^&*?[]<>():/\\-+ \t".indexOf(j) !== -1
        },
        keyDown: function (j) {
            if (j.charCode === 0 || j._charCode === 0) return this.editor.processKeyEvent(j, this, {
                isTextView: true
            });
            else if (j.keyCode === 9) j.preventDefault();
            else return false
        },
        layoutManagerChangedTextAtRow: function () {
            this._repositionSelection()
        },
        layoutManagerInvalidatedRects: function (j, q) {
            q.forEach(this.invalidateRect, this)
        },
        mouseDown: function (j) {
            r.stopEvent(j);
            this._mouseIsDown = this.hasFocus = true;
            var q = this.computeWithClippingFrame(j.layerX, j.layerY);
            r.mixin(q, {
                layerX: j.layerX,
                layerY: j.layerY
            });
            switch (j.detail) {
            case 1:
                var t = this._selectionPositionForPoint(q);
                this.moveCursorTo(t, j.shiftKey);
                break;
            case 2:
                t = this._selectionPositionForPoint(q);
                var B = this.editor.layoutManager.textStorage.lines[t.row];
                if (B.length === 0) return true;
                t.col -= t.col == B.length ? 1 : 0;
                var C = !this.isDelimiter(B[t.col]),
                    e = this,
                    K = function (L, n) {
                        for (; L > -1 && L < B.length; L += n) if (e.isDelimiter(B[L]) === C) break;
                        return L + (n == 1 ? 0 : 1)
                    };j = K(t.col, -1);K = K(t.col, 1);this.moveCursorTo({
                    row: t.row,
                    col: j
                });this.moveCursorTo({
                    row: t.row,
                    col: K
                }, true);
                break;
            case 3:
                j = this.editor.layoutManager.textStorage.lines;t = this._selectionPositionForPoint(q);this.setSelection({
                    start: {
                        row: t.row,
                        col: 0
                    },
                    end: {
                        row: t.row,
                        col: j[t.row].length
                    }
                });
                break
            }
            this._dragPoint = q;
            this._dragTimer = setInterval(this._scrollWhileDragging.bind(this), 100)
        },
        mouseMove: function (j) {
            if (this._mouseIsDown) {
                this._dragPoint = this.computeWithClippingFrame(j.layerX, j.layerY);
                r.mixin(this._dragPoint, {
                    layerX: j.layerX,
                    layerY: j.layerY
                });
                this._drag()
            }
        },
        mouseUp: function () {
            this._mouseIsDown = false;
            if (this._dragTimer !== null) {
                clearInterval(this._dragTimer);
                this._dragTimer = null
            }
        },
        moveCursorTo: function (j, q, t) {
            var B = this.editor.layoutManager.textStorage,
                C = B.clampPosition(j);
            this.setSelection({
                start: q ? this.editor.buffer._selectedRange.start : C,
                end: C
            });
            if (t) {
                q = B.lines.length;
                t = j.row;
                B = j.col;
                this.editor.buffer._selectedRangeEndVirtual = t > 0 && t < q ? j : {
                    row: t < 1 ? 0 : q - 1,
                    col: B
                }
            } else this.editor.buffer._selectedRangeEndVirtual = null;
            this.scrollToPosition(this.editor.buffer._selectedRange.end)
        },
        moveDown: function () {
            var j = this._getVirtualSelection();
            j = d.normalizeRange(j);
            j = this._rangeIsInsertionPoint(this.editor.buffer._selectedRange) ? j.end : {
                row: j.end.row,
                col: j.start.col
            };j = d.addPositions(j, {
                row: 1,
                col: 0
            });this.moveCursorTo(j, false, true)
        },
        moveLeft: function () {
            var j = d.normalizeRange(this.editor.buffer._selectedRange);
            this._rangeIsInsertionPoint(j) ? this.moveCursorTo(this.editor.layoutManager.textStorage.displacePosition(j.start, -1)) : this.moveCursorTo(j.start)
        },
        moveRight: function () {
            var j = d.normalizeRange(this.editor.buffer._selectedRange);
            this._rangeIsInsertionPoint(j) ? this.moveCursorTo(this.editor.layoutManager.textStorage.displacePosition(j.end, 1)) : this.moveCursorTo(j.end)
        },
        moveUp: function () {
            var j =
            d.normalizeRange(this._getVirtualSelection(true));
            position = d.addPositions({
                row: j.start.row,
                col: this._getVirtualSelection().end.col
            }, {
                row: -1,
                col: 0
            });
            this.moveCursorTo(position, false, true)
        },
        parentViewFrameChanged: function () {
            arguments.callee.base.apply(this, arguments);
            this._resize()
        },
        replaceCharacters: function (j, q) {
            if (this._isReadOnly()) return false;
            this.groupChanges(function () {
                j = d.normalizeRange(j);
                this.willReplaceRange(this, j);
                this.editor.layoutManager.textStorage.replaceCharacters(j, q);
                this.replacedCharacters(this, j, q)
            }.bind(this));
            return true
        },
        performBackspaceOrDelete: function (j) {
            if (this._isReadOnly()) return false;
            var q = this.editor.layoutManager.textStorage,
                t = q.lines,
                B = "";
            B = 0;
            var C = g.get("tabstop"),
                e = this.getSelectedRange();
            if (d.isZeroLength(e)) if (j) {
                j = e.start;
                B = t[j.row];
                B = B.substring(0, j.col).match(/\s*$/)[0].length < C || (j.col - C) % C != 0 ? 1 : C;e = {
                    start: q.displacePosition(j, B * -1),
                    end: e.end
                }
            } else {
                j = e.end;
                B = t[j.row];
                B = B.substring(j.col).match(/^\s*/)[0].length < C ? 1 : C;e = {
                    start: e.start,
                    end: q.displacePosition(e.end, B)
                }
            }
            this.groupChanges(function () {
                this.replaceCharacters(e, "");
                this.moveCursorTo(e.start)
            }.bind(this));
            return true
        },
        resetKeyBuffers: function () {
            this._keyMetaBuffer = this._keyBuffer = ""
        },
        scrollPageDown: function () {
            this._scrollPage(false)
        },
        scrollPageUp: function () {
            this._scrollPage(true)
        },
        scrollToPosition: function (j) {
            var q = this.editor.layoutManager.characterRectForPosition(j);
            j = q.x;
            var t = q.y,
                B = q.width;
            q = q.height;
            var C = this.clippingFrame,
                e = C.x,
                K = C.y,
                L = this.padding,
                n = C.width - L.right;
            C = C.height - L.bottom;
            this.editor.scrollTo({
                x: j >= e + 30 && j + B < e + n ? e : j - n / 2 + B / 2,
                y: t >= K && t + q < K + C ? K : t - C / 2 + q / 2
            })
        },
        selectAll: function () {
            var j = this.editor.layoutManager.textStorage.lines,
                q = j.length - 1;
            this.setSelection({
                start: {
                    row: 0,
                    col: 0
                },
                end: {
                    row: q,
                    col: j[q].length
                }
            })
        },
        selectDown: function () {
            this._performVerticalKeyboardSelection(1)
        },
        selectLeft: function () {
            this.moveCursorTo(this.editor.layoutManager.textStorage.displacePosition(this.editor.buffer._selectedRange.end, -1), true)
        },
        selectRight: function () {
            this.moveCursorTo(this.editor.layoutManager.textStorage.displacePosition(this.editor.buffer._selectedRange.end, 1), true)
        },
        selectUp: function () {
            this._performVerticalKeyboardSelection(-1)
        },
        setSelection: function (j, q) {
            var t = this.editor.layoutManager.textStorage;
            j = t.clampRange(j);
            if (!d.equal(j, this.editor.buffer._selectedRange)) {
                this._invalidateSelection();
                this.editor.buffer._selectedRange = j = t.clampRange(j);
                this._invalidateSelection();
                this._hasFocus && this._rearmInsertionPointBlinkTimer();
                q && this.scrollToPosition(j.end);
                this.selectionChanged(j);
                v.publish(this.editor, "editorChange", "selection", j)
            }
        },
        textInserted: function (j) {
            if (j !== "\n") if (!this.editor.processKeyEvent(j, this, {
                isTextView: true,
                isCommandKey: false
            })) {
                this.insertText(j);
                this.resetKeyBuffers()
            }
        },
        _setFocus: function (j, q) {
            if (j != this._hasFocus) if (this._hasFocus = j) {
                this._rearmInsertionPointBlinkTimer();
                this._invalidateSelection();
                q || this.textInput.focus()
            } else {
                if (this._insertionPointBlinkTimer) {
                    clearInterval(this._insertionPointBlinkTimer);
                    this._insertionPointBlinkTimer = null
                }
                this._insertionPointVisible = true;
                this._invalidateSelection();
                q || this.textInput.blur()
            }
        }
    });
    Object.defineProperties(s.TextView.prototype, {
        hasFocus: {
            get: function () {
                return this._hasFocus
            },
            set: function (j) {
                this._setFocus(j, false)
            }
        }
    })
});
bespin.tiki.module("text_editor:views/textinput", function (y, s) {
    var v = y("bespin:util/util");
    y("events");
    var r = y("keyboard:keyutil");
    s.TextInput = function (l, h) {
        var d = this.domNode = document.createElement("textarea");
        d.setAttribute("style", "position: absolute; z-index: -99999; width: 0px; height: 0px; margin: 0px; outline: none; border: 0;");
        l.appendChild(d);
        this.delegate = h;
        this._attachEvents()
    };
    s.TextInput.prototype = {
        _composing: false,
        domNode: null,
        delegate: null,
        _textFieldChanged: function () {
            if (!(this._composing || this._ignore)) {
                var l = this.domNode,
                    h = l.value;
                if (h != "") {
                    l.value = "";
                    this._textInserted(h)
                }
            }
        },
        _copy: function () {
            var l = false,
                h = this.delegate;
            if (h && h.copy) l = h.copy();
            return l
        },
        _cut: function () {
            var l = false,
                h = this.delegate;
            if (h && h.cut) l = h.cut();
            return l
        },
        _textInserted: function (l) {
            var h = this.delegate;
            h && h.textInserted && h.textInserted(l)
        },
        _setValueAndSelect: function (l) {
            var h = this.domNode;
            h.value = l;
            h.select()
        },
        focus: function () {
            this.domNode.focus()
        },
        blur: function () {
            this.domNode.blur()
        },
        _attachEvents: function () {
            var l =
            this.domNode,
                h = this;
            l.addEventListener("focus", function () {
                h.delegate && h.delegate.didFocus && h.delegate.didFocus()
            }, false);
            l.addEventListener("blur", function () {
                h.delegate && h.delegate.didBlur && h.delegate.didBlur()
            }, false);
            r.addKeyDownListener(l, function (g) {
                return h.delegate && h.delegate.keyDown ? h.delegate.keyDown(g) : false
            });
            if (v.isWebKit) {
                v.isChrome || l.addEventListener("compositionend", function (g) {
                    h._textInserted(g.data)
                }, false);
                l.addEventListener("textInput", function (g) {
                    h._textInserted(g.data)
                }, false);
                l.addEventListener("paste", function (g) {
                    h._textInserted(g.clipboardData.getData("text/plain"));
                    g.preventDefault()
                }, false)
            } else {
                var d = h._textFieldChanged.bind(h);
                l.addEventListener("keydown", function () {
                    window.setTimeout(d, 0)
                }, false);
                l.addEventListener("keypress", d, false);
                l.addEventListener("keyup", d, false);
                l.addEventListener("compositionstart", function () {
                    h._composing = true
                }, false);
                l.addEventListener("compositionend", function () {
                    h._composing = false;
                    h._textFieldChanged()
                }, false);
                l.addEventListener("paste", function () {
                    h._setValueAndSelect("");
                    window.setTimeout(function () {
                        h._textFieldChanged()
                    }, 0)
                }, false)
            }
            var f = function (g) {
                g = g.type.indexOf("copy") != -1 ? h._copy() : h._cut();h._setValueAndSelect(g)
            };
            if (v.isWebKit && !v.isChrome && v.isMac) {
                var m = (new Date).getTime(),
                    i = function (g) {
                        var j = g.type.indexOf("cut") != -1;
                        if (!(j && (new Date).getTime() - m < 10)) {
                            f(g);
                            if (j) m = (new Date).getTime()
                        }
                    };
                l.addEventListener("beforecopy", i, false);
                l.addEventListener("beforecut", i, false)
            } else {
                i = false;
                if (v.isMozilla) i = function (g) {
                    f(g);
                    h._ignore =
                    true;
                    window.setTimeout(function () {
                        h._setValueAndSelect("");
                        h._ignore = false
                    }, 0)
                };
                l.addEventListener("copy", i || f, false);
                l.addEventListener("cut", i || f, false)
            }
        }
    }
});
bespin.tiki.module("text_editor:index", function () {});
bespin.tiki.register("::less", {
    name: "less",
    dependencies: {}
});
bespin.tiki.module("less:index", function (y, s) {
    function v(d) {
        if (d instanceof h.Dimension) return parseFloat(d.unit == "%" ? d.value / 100 : d.value);
        else if (typeof d === "number") return d;
        else throw {
            error: "RuntimeError",
            message: "color functions take numbers as parameters"
        };
    }
    function r(d) {
        return Math.min(1, Math.max(0, d))
    }
    if (!Array.isArray) Array.isArray = function (d) {
        return Object.prototype.toString.call(d) === "[object Array]" || d instanceof Array
    };
    if (!Array.prototype.forEach) Array.prototype.forEach = function (d, f) {
        for (var m =
        this.length >>> 0, i = 0; i < m; i++) i in this && d.call(f, this[i], i, this)
    };
    if (!Array.prototype.map) Array.prototype.map = function (d, f) {
        for (var m = this.length >>> 0, i = new Array(m), g = 0; g < m; g++) if (g in this) i[g] = d.call(f, this[g], g, this);
        return i
    };
    if (!Array.prototype.filter) Array.prototype.filter = function (d, f) {
        for (var m = [], i = 0; i < this.length; i++) d.call(f, this[i]) && m.push(this[i]);
        return m
    };
    if (!Array.prototype.reduce) Array.prototype.reduce = function (d) {
        var f = this.length >>> 0,
            m = 0;
        if (f === 0 && arguments.length === 1) throw new TypeError;
        if (arguments.length >= 2) var i = arguments[1];
        else {
            do {
                if (m in this) {
                    i = this[m++];
                    break
                }
                if (++m >= f) throw new TypeError;
            } while (1)
        }
        for (; m < f; m++) if (m in this) i = d.call(null, i, this[m], m, this);
        return i
    };
    if (!Array.prototype.indexOf) Array.prototype.indexOf = function (d, f) {
        var m = this.length;
        f = f || 0;
        if (!m) return -1;
        if (f >= m) return -1;
        if (f < 0) f += m;
        for (; f < m; f++) if (Object.prototype.hasOwnProperty.call(this, f)) if (d === this[f]) return f;
        return -1
    };
    if (!Object.keys) Object.keys = function (d) {
        var f = [];
        for (var m in d) Object.prototype.hasOwnProperty.call(d, m) && f.push(m);
        return f
    };
    if (!String.prototype.trim) String.prototype.trim = function () {
        return String(this).replace(/^\s\s*/, "").replace(/\s\s*$/, "")
    };
    if (typeof y !== "undefined") var l = s,
        h = {};
    else l = h = {};
    l.Parser = function (d) {
        function f(n) {
            var w, D, J;
            if (n instanceof Function) return n.call(C.parsers);
            else if (typeof n === "string") {
                w = i.charAt(g) === n ? n : null;D = 1
            } else {
                if (g >= B + t[j].length && j < t.length - 1) B += t[j++].length;
                n.lastIndex = J = g - B;
                if (w = n.exec(t[j])) {
                    D = w[0].length;
                    if (n.lastIndex - D !== J) return
                }
            }
            if (w) {
                g += D;
                for (D =
                B + t[j].length; g <= D;) {
                    n = i.charCodeAt(g);
                    if (!(n === 32 || n === 10 || n === 9)) break;
                    g++
                }
                return typeof w === "string" ? w : w.length === 1 ? w[0] : w
            }
        }
        function m(n) {
            var w;
            if (typeof n === "string") return i.charAt(g) === n;
            else {
                n.lastIndex = g;
                if ((w = n.exec(i)) && n.lastIndex - w[0].length === g) return w
            }
        }
        var i, g, j, q, t, B, C, e = this,
            K = function () {},
            L = this.imports = {
                paths: d && d.paths || [],
                queue: [],
                files: {},
                push: function (n, w) {
                    var D = this;
                    this.queue.push(n);
                    l.Parser.importer(n, this.paths, function (J) {
                        D.queue.splice(D.queue.indexOf(n), 1);
                        D.files[n] =
                        J;
                        w(J);
                        D.queue.length === 0 && K()
                    })
                }
            };
        this.env = d || {};
        this.optimization = "optimization" in this.env ? this.env.optimization : 1;
        return C = {
            imports: L,
            parse: function (n, w) {
                var D, J, Q = null;
                g = j = B = q = 0;
                t = [];
                i = n.replace(/\r\n/g, "\n");
                if (e.optimization > 0) {
                    i = i.replace(/\/\*(?:[^*]|\*+[^\/*])*\*+\//g, function (ca) {
                        return e.optimization > 1 ? "" : ca.replace(/\n(\s*\n)+/g, "\n")
                    });
                    t = i.split(/^(?=\n)/mg)
                } else t = [i];
                D = new h.Ruleset([], f(this.parsers.primary));
                D.root = true;
                D.toCSS = function (ca) {
                    var ha, ga;
                    return function () {
                        try {
                            return ca.call(this)
                        } catch (la) {
                            ga =
                            i.split("\n");
                            ha = (i.slice(0, la.index).match(/\n/g) || "").length + 1;
                            for (var ma = la.index, na = -1; ma >= 0 && i.charAt(ma) !== "\n"; ma--) na++;
                            throw {
                                name: "NameError",
                                message: la.message,
                                line: ha,
                                column: na,
                                extract: [ga[ha - 2], ga[ha - 1], ga[ha]]
                            };
                        }
                    }
                }(D.toCSS);
                if (g < i.length - 1) {
                    g = q;
                    J = i.split("\n");
                    n = (i.slice(0, g).match(/\n/g) || "").length + 1;
                    for (var Z = g, T = -1; Z >= 0 && i.charAt(Z) !== "\n"; Z--) T++;
                    Q = {
                        name: "ParseError",
                        message: "Syntax Error on line " + n,
                        filename: d.filename,
                        line: n,
                        column: T,
                        extract: [J[n - 2], J[n - 1], J[n]]
                    }
                }
                if (this.imports.queue.length > 0) K = function () {
                    w(Q, D)
                };
                else w(Q, D)
            },
            parsers: {
                primary: function () {
                    for (var n, w = []; n = f(this.mixin.definition) || f(this.rule) || f(this.ruleset) || f(this.mixin.call) || f(this.comment) || f(/[\n\s]+/g) || f(this.directive);) w.push(n);
                    return w
                },
                comment: function () {
                    var n;
                    if (i.charAt(g) === "/") return (n = f(/\/\*(?:[^*]|\*+[^\/*])*\*+\/\n?/g)) ? new h.Comment(n) : f(/\/\/.*/g)
                },
                entities: {
                    quoted: function () {
                        var n;
                        if (!(i.charAt(g) !== '"' && i.charAt(g) !== "'")) if (n = f(/"((?:[^"\\\r\n]|\\.)*)"|'((?:[^'\\\r\n]|\\.)*)'/g)) return new h.Quoted(n[0], n[1] || n[2])
                    },
                    keyword: function () {
                        var n;
                        if (n = f(/[A-Za-z-]+/g)) return new h.Keyword(n)
                    },
                    call: function () {
                        var n, w;
                        if (n = f(/([a-zA-Z0-9_-]+|%)\(/g)) {
                            if (n[1].toLowerCase() === "alpha") return f(this.alpha);
                            w = f(this.entities.arguments);
                            if (f(")")) if (n) return new h.Call(n[1], w)
                        }
                    },
                    arguments: function () {
                        for (var n = [], w; w = f(this.expression);) {
                            n.push(w);
                            if (!f(",")) break
                        }
                        return n
                    },
                    literal: function () {
                        return f(this.entities.dimension) || f(this.entities.color) || f(this.entities.quoted)
                    },
                    url: function () {
                        var n;
                        if (!(i.charAt(g) !== "u" || !f(/url\(/g))) {
                            n = f(this.entities.quoted) || f(/[-a-zA-Z0-9_%@$\/.&=:;#+?]+/g);
                            if (!f(")")) throw new Error("missing closing ) for url()");
                            return new h.URL(n.value ? n : new h.Anonymous(n))
                        }
                    },
                    variable: function () {
                        var n, w = g;
                        if (i.charAt(g) === "@" && (n = f(/@[a-zA-Z0-9_-]+/g))) return new h.Variable(n, w)
                    },
                    color: function () {
                        var n;
                        if (i.charAt(g) === "#" && (n = f(/#([a-fA-F0-9]{6}|[a-fA-F0-9]{3})/g))) return new h.Color(n[1])
                    },
                    dimension: function () {
                        var n;
                        n = i.charCodeAt(g);
                        if (!(n > 57 || n < 45 || n === 47)) if (n = f(/(-?[0-9]*\.?[0-9]+)(px|%|em|pc|ex|in|deg|s|ms|pt|cm|mm)?/g)) return new h.Dimension(n[1], n[2])
                    }
                },
                variable: function () {
                    var n;
                    if (i.charAt(g) === "@" && (n = f(/(@[a-zA-Z0-9_-]+)\s*:/g))) return n[1]
                },
                shorthand: function () {
                    var n, w;
                    if (m(/[@\w.-]+\/[@\w.-]+/g)) if ((n = f(this.entity)) && f("/") && (w = f(this.entity))) return new h.Shorthand(n, w)
                },
                mixin: {
                    call: function () {
                        for (var n = [], w, D, J, Q = g; w = f(/[#.][a-zA-Z0-9_-]+/g);) {
                            n.push(new h.Element(D, w));
                            D = f(">")
                        }
                        f("(") && (J = f(this.entities.arguments)) && f(")");
                        if (n.length > 0 && (f(";") || m("}"))) return new h.mixin.Call(n, J, Q)
                    },
                    definition: function () {
                        var n, w = [],
                            D, J;
                        if (!(i.charAt(g) !== "." || m(/[^{]*(;|})/g))) if (n = f(/([#.][a-zA-Z0-9_-]+)\s*\(/g)) {
                            for (n = n[1]; D = f(/@[\w-]+/g) || f(this.entities.literal) || f(this.entities.keyword);) {
                                if (D[0] === "@") if (f(":")) if (J = f(this.expression)) w.push({
                                    name: D,
                                    value: J
                                });
                                else throw new Error("Expected value");
                                else w.push({
                                    name: D
                                });
                                else w.push({
                                    value: D
                                });
                                if (!f(",")) break
                            }
                            if (!f(")")) throw new Error("Expected )");
                            if (D = f(this.block)) return new h.mixin.Definition(n, w, D)
                        }
                    }
                },
                entity: function () {
                    return f(this.entities.literal) || f(this.entities.variable) || f(this.entities.url) || f(this.entities.call) || f(this.entities.keyword)
                },
                end: function () {
                    return f(";") || m("}")
                },
                alpha: function () {
                    var n;
                    if (f(/opacity=/gi)) if (n = f(/[0-9]+/g) || f(this.entities.variable)) {
                        if (!f(")")) throw new Error("missing closing ) for alpha()");
                        return new h.Alpha(n)
                    }
                },
                element: function () {
                    var n;
                    c = f(this.combinator);
                    if (n = f(/[.#:]?[a-zA-Z0-9_-]+/g) || f("*") || f(this.attribute) || f(/\([^)@]+\)/g)) return new h.Element(c, n)
                },
                combinator: function () {
                    var n;
                    return (n = f(/[+>~]/g) || f("&") || f(/::/g)) ? new h.Combinator(n) : new h.Combinator(i.charAt(g - 1) === " " ? " " : null)
                },
                selector: function () {
                    for (var n, w = []; n = f(this.element);) w.push(n);
                    if (w.length > 0) return new h.Selector(w)
                },
                tag: function () {
                    return f(/[a-zA-Z][a-zA-Z-]*[0-9]?/g) || f("*")
                },
                attribute: function () {
                    var n = "",
                        w, D, J;
                    if (f("[")) {
                        if (w = f(/[a-z-]+/g) || f(this.entities.quoted)) n = (J = f(/[|~*$^]?=/g)) && (D = f(this.entities.quoted) || f(/[\w-]+/g)) ? [w, J, D.toCSS ? D.toCSS() : D].join("") : w;
                        if (f("]")) if (n) return "[" + n + "]"
                    }
                },
                block: function () {
                    var n;
                    if (f("{") && (n = f(this.primary)) && f("}")) return n
                },
                ruleset: function () {
                    var n = [],
                        w, D, J = g;
                    if (w = m(/([a-z.#: _-]+)[\s\n]*\{/g)) {
                        g += w[0].length - 1;
                        n = [new h.Selector([new h.Element(null, w[1])])]
                    } else {
                        for (; w = f(this.selector);) {
                            n.push(w);
                            if (!f(",")) break
                        }
                        w && f(this.comment)
                    }
                    if (n.length > 0 && (D = f(this.block))) return new h.Ruleset(n, D);
                    else {
                        q = g;
                        g = J
                    }
                },
                rule: function () {
                    var n, w = g;
                    if (name = f(this.property) || f(this.variable)) {
                        if (name.charAt(0) != "@" && (match = m(/([^@+\/*(;{}-]*);/g))) {
                            g += match[0].length - 1;
                            n = new h.Anonymous(match[1])
                        } else n = name === "font" ? f(this.font) : f(this.value);
                        if (f(this.end)) return new h.Rule(name, n, w);
                        else {
                            q = g;
                            g = w
                        }
                    }
                },
                "import": function () {
                    var n;
                    if (f(/@import\s+/g) && (n = f(this.entities.quoted) || f(this.entities.url)) && f(";")) return new h.Import(n, L)
                },
                directive: function () {
                    var n, w, D;
                    if (i.charAt(g) === "@") if (w = f(this["import"])) return w;
                    else if (n = f(/@media|@page/g)) {
                        D = f(/[^{]+/g).trim();
                        if (w = f(this.block)) return new h.Directive(n + " " + D, w)
                    } else if (n = f(/@[-a-z]+/g)) if (n === "@font-face") {
                        if (w = f(this.block)) return new h.Directive(n, w)
                    } else if ((w = f(this.entity)) && f(";")) return new h.Directive(n, w)
                },
                font: function () {
                    for (var n = [], w = [], D; D = f(this.shorthand) || f(this.entity);) w.push(D);
                    n.push(new h.Expression(w));
                    if (f(",")) for (; D = f(this.expression);) {
                        n.push(D);
                        if (!f(",")) break
                    }
                    return new h.Value(n, f(this.important))
                },
                value: function () {
                    for (var n, w = []; n = f(this.expression);) {
                        w.push(n);
                        if (!f(",")) break
                    }
                    n = f(this.important);
                    if (w.length > 0) return new h.Value(w, n)
                },
                important: function () {
                    return f(/!\s*important/g)
                },
                sub: function () {
                    var n;
                    if (f("(") && (n = f(this.expression)) && f(")")) return n
                },
                multiplication: function () {
                    var n, w, D, J;
                    if (n = f(this.operand)) {
                        for (;
                        (D =
                        f(/[\/*]/g)) && (w = f(this.operand));) J = new h.Operation(D, [J || n, w]);
                        return J || n
                    }
                },
                addition: function () {
                    var n, w, D, J;
                    if (n = f(this.multiplication)) {
                        for (;
                        (D = f(/[-+]\s+/g) || i.charAt(g - 1) != " " && f(/[-+]/g)) && (w = f(this.multiplication));) J = new h.Operation(D, [J || n, w]);
                        return J || n
                    }
                },
                operand: function () {
                    return f(this.sub) || f(this.entities.dimension) || f(this.entities.color) || f(this.entities.variable)
                },
                expression: function () {
                    for (var n, w = []; n = f(this.addition) || f(this.entity);) w.push(n);
                    if (w.length > 0) return new h.Expression(w)
                },
                property: function () {
                    var n;
                    if (n = f(/(\*?-?[-a-z_0-9]+)\s*:/g)) return n[1]
                }
            }
        }
    };
    l.Parser.importer = null;
    h.functions = {
        rgb: function (d, f, m) {
            return this.rgba(d, f, m, 1)
        },
        rgba: function (d, f, m, i) {
            d = [d, f, m].map(function (g) {
                return v(g)
            });
            i = v(i);
            return new h.Color(d, i)
        },
        hsl: function (d, f, m) {
            return this.hsla(d, f, m, 1)
        },
        hsla: function (d, f, m, i) {
            function g(t) {
                t = t < 0 ? t + 1 : t > 1 ? t - 1 : t;
                return t * 6 < 1 ? q + (j - q) * t * 6 : t * 2 < 1 ? j : t * 3 < 2 ? q + (j - q) * (2 / 3 - t) * 6 : q
            }
            d = (v(d) % 360 + 360) % 360 / 360;
            f = v(f);
            m = v(m);
            i = v(i);
            var j = m <= 0.5 ? m * (f + 1) : m + f - m * f,
                q = m * 2 - j;
            return this.rgba(g(d + 1 / 3) * 255, g(d) * 255, g(d - 1 / 3) * 255, i)
        },
        opacity: function (d, f) {
            v(f);
            return new h.Color(d.rgb, v(f))
        },
        saturate: function (d, f) {
            d = d.toHSL();
            d.s += f.value / 100;
            d.s = r(d.s);
            return this.hsl(d.h, d.s, d.l)
        },
        desaturate: function (d, f) {
            d = d.toHSL();
            d.s -= f.value / 100;
            d.s = r(d.s);
            return this.hsl(d.h, d.s, d.l)
        },
        lighten: function (d, f) {
            d = d.toHSL();
            d.l *= 1 + f.value / 100;
            d.l = r(d.l);
            return this.hsl(d.h, d.s, d.l)
        },
        darken: function (d, f) {
            d = d.toHSL();
            d.l *= 1 - f.value / 100;
            d.l = r(d.l);
            return this.hsl(d.h, d.s, d.l)
        },
        greyscale: function (d) {
            return this.desaturate(d, new h.Dimension(100))
        },
        e: function (d) {
            return new h.Anonymous(d)
        },
        "%": function (d) {
            for (var f = Array.prototype.slice.call(arguments, 1), m = d.content, i = 0; i < f.length; i++) m = m.replace(/%s/, f[i].content).replace(/%[da]/, f[i].toCSS());
            m = m.replace(/%%/g, "%");
            return new h.Quoted('"' + m + '"', m)
        }
    };
    h.Alpha = function (d) {
        this.value = d
    };
    h.Alpha.prototype = {
        toCSS: function () {
            return "alpha(opacity=" + this.value.toCSS() + ")"
        },
        eval: function () {
            return this
        }
    };
    h.Anonymous = function (d) {
        this.value = d.content || d
    };
    h.Anonymous.prototype = {
        toCSS: function () {
            return this.value
        },
        eval: function () {
            return this
        }
    };
    h.Call = function (d, f) {
        this.name = d;
        this.args = f
    };
    h.Call.prototype = {
        eval: function (d) {
            var f = this.args.map(function (m) {
                return m.eval(d)
            });
            return this.name in h.functions ? h.functions[this.name].apply(h.functions, f) : new h.Anonymous(this.name + "(" + f.map(function (m) {
                return m.toCSS()
            }).join(", ") + ")")
        },
        toCSS: function (d) {
            return this.eval(d).toCSS()
        }
    };
    h.Color = function (d, f) {
        if (Array.isArray(d)) {
            this.rgb = d;
            this.alpha = f
        } else this.rgb = d.length == 6 ? d.match(/.{2}/g).map(function (m) {
            return parseInt(m, 16)
        }) : d.split("").map(function (m) {
            return parseInt(m + m, 16)
        })
    };
    h.Color.prototype = {
        eval: function () {
            return this
        },
        toCSS: function () {
            return this.alpha && this.alpha < 1 ? "rgba(" + this.rgb.concat(this.alpha).join(", ") + ")" : "#" + this.rgb.map(function (d) {
                d = Math.round(d);
                d = (d > 255 ? 255 : d < 0 ? 0 : d).toString(16);
                return d.length === 1 ? "0" + d : d
            }).join("")
        },
        operate: function (d, f) {
            var m = [];
            f instanceof h.Color || (f = f.toColor());
            for (var i = 0; i < 3; i++) m[i] = h.operate(d, this.rgb[i], f.rgb[i]);
            return new h.Color(m)
        },
        toHSL: function () {
            var d =
            this.rgb[0] / 255,
                f = this.rgb[1] / 255,
                m = this.rgb[2] / 255,
                i = Math.max(d, f, m),
                g = Math.min(d, f, m),
                j, q = (i + g) / 2,
                t = i - g;
            if (i === g) j = g = 0;
            else {
                g = q > 0.5 ? t / (2 - i - g) : t / (i + g);
                switch (i) {
                case d:
                    j = (f - m) / t + (f < m ? 6 : 0);
                    break;
                case f:
                    j = (m - d) / t + 2;
                    break;
                case m:
                    j = (d - f) / t + 4;
                    break
                }
                j /= 6
            }
            return {
                h: j * 360,
                s: g,
                l: q
            }
        }
    };
    h.Comment = function (d) {
        this.value = d
    };
    h.Comment.prototype = {
        toCSS: function () {
            return this.value
        }
    };
    h.Dimension = function (d, f) {
        this.value = parseFloat(d);
        this.unit = f || null
    };
    h.Dimension.prototype = {
        eval: function () {
            return this
        },
        toColor: function () {
            return new h.Color([this.value, this.value, this.value])
        },
        toCSS: function () {
            return this.value + this.unit
        },
        operate: function (d, f) {
            return new h.Dimension(h.operate(d, this.value, f.value), this.unit || f.unit)
        }
    };
    h.Directive = function (d, f) {
        this.name = d;
        if (Array.isArray(f)) this.ruleset = new h.Ruleset([], f);
        else this.value = f
    };
    h.Directive.prototype = {
        toCSS: function (d, f) {
            if (this.ruleset) {
                this.ruleset.root = true;
                return this.name + " {\n  " + this.ruleset.toCSS(d, f).trim().replace(/\n/g, "\n  ") + "\n}\n"
            } else return this.name + " " + this.value.toCSS() + ";\n"
        },
        eval: function (d) {
            d.frames.unshift(this);
            this.ruleset && this.ruleset.evalRules(d);
            d.frames.shift();
            return this
        },
        variable: function (d) {
            return h.Ruleset.prototype.variable.call(this.ruleset, d)
        },
        find: function () {
            return h.Ruleset.prototype.find.apply(this.ruleset, arguments)
        },
        rulesets: function () {
            return h.Ruleset.prototype.rulesets.apply(this.ruleset)
        }
    };
    h.Element = function (d, f) {
        this.combinator = d instanceof h.Combinator ? d : new h.Combinator(d);this.value = f.trim()
    };
    h.Element.prototype.toCSS = function () {
        return this.combinator.toCSS() + this.value
    };
    h.Combinator = function (d) {
        this.value = d === " " ? " " : d ? d.trim() : ""
    };
    h.Combinator.prototype.toCSS = function () {
        switch (this.value) {
        case "":
            return "";
        case " ":
            return " ";
        case "&":
            return "";
        case ":":
            return " :";
        case "::":
            return "::";
        case "+":
            return " + ";
        case "~":
            return " ~ ";
        case ">":
            return " > "
        }
    };
    h.Expression = function (d) {
        this.value = d
    };
    h.Expression.prototype = {
        eval: function (d) {
            return this.value.length > 1 ? new h.Expression(this.value.map(function (f) {
                return f.eval(d)
            })) : this.value[0].eval(d)
        },
        toCSS: function () {
            return this.value.map(function (d) {
                return d.toCSS()
            }).join(" ")
        }
    };
    h.Import = function (d, f) {
        var m = this;
        this._path = d;
        this.path = d instanceof h.Quoted ? /\.(le?|c)ss$/.test(d.content) ? d.content : d.content + ".less" : d.value.content || d.value;
        (this.css = /css$/.test(this.path)) || f.push(this.path, function (i) {
            m.root = i
        })
    };
    h.Import.prototype = {
        toCSS: function () {
            return this.css ? "@import " + this._path.toCSS() + ";\n" : ""
        },
        eval: function () {
            if (this.css) return this;
            else {
                for (var d = 0; d < this.root.rules.length; d++) this.root.rules[d] instanceof h.Import && Array.prototype.splice.apply(this.root.rules, [d, 1].concat(this.root.rules[d].eval()));
                return this.root.rules
            }
        }
    };
    h.Keyword = function (d) {
        this.value = d
    };
    h.Keyword.prototype = {
        eval: function () {
            return this
        },
        toCSS: function () {
            return this.value
        }
    };
    h.mixin = {};
    h.mixin.Call = function (d, f, m) {
        this.selector = new h.Selector(d);
        this.arguments = f;
        this.index = m
    };
    h.mixin.Call.prototype = {
        eval: function (d) {
            for (var f, m = [], i = false, g = 0; g < d.frames.length; g++) if ((f = d.frames[g].find(this.selector)).length > 0) {
                for (g = 0; g < f.length; g++) if (f[g].match(this.arguments, d)) try {
                    Array.prototype.push.apply(m, f[g].eval(this.arguments, d).rules);
                    i = true
                } catch (j) {
                    throw {
                        message: j.message,
                        index: this.index
                    };
                }
                if (i) return m;
                else throw {
                    message: "No matching definition was found for `" + this.selector.toCSS().trim() + "(" + this.arguments.map(function (q) {
                        return q.toCSS()
                    }).join(", ") + ")`",
                    index: this.index
                };
            }
            throw {
                message: this.selector.toCSS().trim() + " is undefined",
                index: this.index
            };
        }
    };
    h.mixin.Definition = function (d, f, m) {
        this.name = d;
        this.selectors = [new h.Selector([new h.Element(null, d)])];
        this.params = f;
        this.arity = f.length;
        this.rules = m;
        this._lookups = {};
        this.required = f.reduce(function (i, g) {
            return g.name && !g.value ? i + 1 : i
        }, 0)
    };
    h.mixin.Definition.prototype = {
        toCSS: function () {
            return ""
        },
        variable: function (d) {
            return h.Ruleset.prototype.variable.call(this, d)
        },
        find: function () {
            return h.Ruleset.prototype.find.apply(this, arguments)
        },
        rulesets: function () {
            return h.Ruleset.prototype.rulesets.apply(this)
        },
        eval: function (d, f) {
            for (var m = new h.Ruleset(null, []), i = 0, g; i < this.params.length; i++) if (this.params[i].name) if (g = d && d[i] || this.params[i].value) m.rules.unshift(new h.Rule(this.params[i].name, g.eval(f)));
            else throw {
                message: "wrong number of arguments for " + this.name + " (" + d.length + " for " + this.arity + ")"
            };
            return (new h.Ruleset(null, this.rules)).evalRules({
                frames: [this, m].concat(f.frames)
            })
        },
        match: function (d, f) {
            var m = d && d.length || 0;
            if (m < this.required) return false;
            for (var i = 0; i < Math.min(m, this.arity); i++) if (!this.params[i].name) if (!d[i].wildcard) if (d[i].eval(f).toCSS() != this.params[i].value.eval(f).toCSS()) return false;
            return true
        }
    };
    h.Operation = function (d, f) {
        this.op = d.trim();
        this.operands = f
    };
    h.Operation.prototype.eval = function (d) {
        var f = this.operands[0].eval(d);
        d = this.operands[1].eval(d);
        var m;
        if (f instanceof h.Dimension && d instanceof h.Color) if (this.op === "*" || this.op === "+") {
            m = d;
            d = f;
            f = m
        } else throw {
            name: "OperationError",
            message: "Can't substract or divide a color from a number"
        };
        return f.operate(this.op, d)
    };
    h.operate = function (d, f, m) {
        switch (d) {
        case "+":
            return f + m;
        case "-":
            return f - m;
        case "*":
            return f * m;
        case "/":
            return f / m
        }
    };
    h.Quoted = function (d, f) {
        this.value = d;
        this.content = f
    };
    h.Quoted.prototype = {
        toCSS: function () {
            return this.value
        },
        eval: function () {
            return this
        }
    };
    h.Rule = function (d, f, m) {
        this.name = d;
        this.value = f instanceof h.Value ? f : new h.Value([f]);this.index = m;this.variable = d.charAt(0) === "@" ? true : false
    };
    h.Rule.prototype.toCSS = function () {
        return this.variable ? "" : this.name + ": " + this.value.toCSS() + ";"
    };
    h.Rule.prototype.eval = function (d) {
        return new h.Rule(this.name, this.value.eval(d))
    };
    h.Value = function (d) {
        this.value = d;
        this.is = "value"
    };
    h.Value.prototype = {
        eval: function (d) {
            return this.value.length === 1 ? this.value[0].eval(d) : new h.Value(this.value.map(function (f) {
                return f.eval(d)
            }))
        },
        toCSS: function () {
            return this.value.map(function (d) {
                return d.toCSS()
            }).join(", ")
        }
    };
    h.Shorthand = function (d, f) {
        this.a = d;
        this.b = f
    };
    h.Shorthand.prototype = {
        toCSS: function (d) {
            return this.a.toCSS(d) + "/" + this.b.toCSS(d)
        },
        eval: function () {
            return this
        }
    };
    h.Ruleset = function (d, f) {
        this.selectors = d;
        this.rules = f;
        this._lookups = {}
    };
    h.Ruleset.prototype = {
        eval: function () {
            return this
        },
        evalRules: function (d) {
            var f = [];
            this.rules.forEach(function (m) {
                if (m.evalRules) f.push(m.evalRules(d));
                else m instanceof h.mixin.Call ? Array.prototype.push.apply(f, m.eval(d)) : f.push(m.eval(d))
            });
            this.rules = f;
            return this
        },
        match: function (d) {
            return !d || d.length === 0
        },
        variable: function (d) {
            return this._variables ? this._variables[d] : (this._variables = this.rules.reduce(function (f, m) {
                if (m instanceof h.Rule && m.variable === true) f[m.name] = m;
                return f
            }, {}))[d]
        },
        rulesets: function () {
            return this._rulesets ? this._rulesets : (this._rulesets = this.rules.filter(function (d) {
                if (d instanceof h.Ruleset || d instanceof h.mixin.Definition) return d
            }))
        },
        find: function (d, f) {
            f = f || this;
            var m = [],
                i = d.toCSS();
            if (i in this._lookups) return this._lookups[i];
            this.rulesets().forEach(function (g) {
                if (g !== f) for (var j = 0; j < g.selectors.length; j++) if (d.match(g.selectors[j])) {
                    d.elements.length > 1 ? Array.prototype.push.apply(m, g.find(new h.Selector(d.elements.slice(1)), f)) : m.push(g);
                    break
                }
            });
            return this._lookups[i] = m
        },
        toCSS: function (d, f) {
            var m = [],
                i = [],
                g = [],
                j = [];
            if (this.root) {
                d = [];
                f = {
                    frames: []
                };
                for (var q = 0; q < this.rules.length; q++) this.rules[q] instanceof h.Import && Array.prototype.splice.apply(this.rules, [q, 1].concat(this.rules[q].eval(f)))
            } else if (d.length === 0) j = this.selectors.map(function (B) {
                return [B]
            });
            else for (q = 0; q < this.selectors.length; q++) for (var t = 0; t < d.length; t++) j.push(d[t].concat([this.selectors[q]]));
            f.frames.unshift(this);
            for (q = 0; q < this.rules.length; q++) this.rules[q] instanceof h.mixin.Call && Array.prototype.splice.apply(this.rules, [q, 1].concat(this.rules[q].eval(f)));
            for (q = 0; q < this.rules.length; q++) {
                d = this.rules[q];
                if (d instanceof h.Directive) g.push(d.eval(f).toCSS(j, f));
                else if (d.rules) g.push(d.toCSS(j, f));
                else if (d instanceof h.Comment) this.root ? g.push(d.toCSS()) : i.push(d.toCSS());
                else if (d.toCSS && !d.variable) i.push(d.eval(f).toCSS());
                else d.value && !d.variable && i.push(d.value.toString())
            }
            g = g.join("");
            if (this.root) m.push(i.join("\n"));
            else if (i.length > 0) {
                j = j.map(function (B) {
                    return B.map(function (C) {
                        return C.toCSS()
                    }).join("").trim()
                }).join(j.length > 3 ? ",\n" : ", ");
                m.push(j, " {\n  " + i.join("\n  ") + "\n}\n")
            }
            m.push(g);
            f.frames.shift();
            return m.join("")
        }
    };
    h.Selector = function (d) {
        this.elements = d;
        if (this.elements[0].combinator.value === "") this.elements[0].combinator.value = " "
    };
    h.Selector.prototype.match = function (d) {
        return this.elements[0].value === d.elements[0].value ? true : false
    };
    h.Selector.prototype.toCSS = function () {
        if (this._css) return this._css;
        return this._css = this.elements.map(function (d) {
            return typeof d === "string" ? " " + d.trim() : d.toCSS()
        }).join("")
    };
    h.URL = function (d) {
        this.value = d
    };
    h.URL.prototype = {
        toCSS: function () {
            return "url(" + this.value.toCSS() + ")"
        },
        eval: function () {
            return this
        }
    };
    h.Variable = function (d, f) {
        this.name = d;
        this.index =
        f
    };
    h.Variable.prototype = {
        eval: function (d) {
            var f, m, i = this.name;
            if (f = h.find(d.frames, function (g) {
                if (m = g.variable(i)) return m.value.eval(d)
            })) return f;
            else throw {
                message: "variable " + this.name + " is undefined",
                index: this.index
            };
        }
    };
    h.find = function (d, f) {
        for (var m = 0, i; m < d.length; m++) if (i = f.call(d, d[m])) return i;
        return null
    };
    (function () {
        function d(C) {
            for (var e = 0; e < t.length; e++) f(t[e], C)
        }
        function f(C, e) {
            var K = typeof localStorage !== "undefined" && localStorage.getItem(C.href),
                L = K && JSON.parse(K);
            i(C.href, function (n, w) {
                if (L && (new Date(w)).valueOf() === (new Date(L.timestamp)).valueOf()) {
                    m(L.css, C);
                    e(null, C, {
                        local: true
                    })
                } else(new l.Parser({
                    optimization: 3
                })).parse(n, function (D, J) {
                    if (D) return q(D, C.href);
                    try {
                        e(J, C, {
                            local: false,
                            lastModified: w
                        })
                    } catch (Q) {
                        q(Q, C.href)
                    }
                })
            }, function (n) {
                throw new Error("Couldn't load " + C.href + " (" + n + ")");
            })
        }
        function m(C, e, K) {
            var L = document.createElement("style");
            L.type = "text/css";
            L.media = "screen";
            L.title = "less-sheet";
            if (e) {
                L.title = e.title || e.href.match(/(?:^|\/)([-\w]+)\.[a-z]+$/i)[1];
                K && typeof localStorage !== "undefined" && localStorage.setItem(e.href, JSON.stringify({
                    timestamp: K,
                    css: C
                }))
            }
            if (L.styleSheet) L.styleSheet.cssText = C;
            else L.appendChild(document.createTextNode(C));
            document.getElementsByTagName("head")[0].appendChild(L)
        }
        function i(C, e, K) {
            var L = g();
            if (window.location.protocol === "file:") {
                L.open("GET", C, false);
                L.send(null);
                L.status === 0 ? e(L.responseText) : K(L.status)
            } else {
                L.open("GET", C, true);
                L.onreadystatechange = function () {
                    if (L.readyState == 4) if (L.status >= 200 && L.status < 300) e(L.responseText, L.getResponseHeader("Last-Modified"));
                    else typeof K === "function" && K(L.status)
                };
                L.send(null)
            }
        }
        function g() {
            if (window.XMLHttpRequest) return new XMLHttpRequest;
            else try {
                return new ActiveXObject("MSXML2.XMLHTTP.3.0")
            } catch (C) {
                j("less: browser doesn't support AJAX.");
                return null
            }
        }
        function j(C) {
            l.env == "development" && typeof console !== "undefined" && console.log(C)
        }
        function q(C, e) {
            var K = document.createElement("div"),
                L;
            K.id = "less-error-message";
            K.innerHTML = "<h3>" + (C.message || "There is an error in your .less file") + '</h3><p><a href="' + e + '">' + e + "</a> on line " + C.line + ", column " + (C.column + 1) + ":</p>" + '<div>\n<pre class="ctx"><span>[-1]</span>{0}</pre>\n<pre><span>[0]</span>{current}</pre>\n<pre class="ctx"><span>[1]</span>{2}</pre>\n</div>'.replace(/\[(-?\d)\]/g, function (n, w) {
                return C.line + parseInt(w)
            }).replace(/\{(\d)\}/g, function (n, w) {
                return C.extract[parseInt(w)]
            }).replace(/\{current\}/, C.extract[1].slice(0, C.column) + '<span class="error">' + C.extract[1].slice(C.column) + "</span>");
            m("#less-error-message span {margin-right: 15px;}#less-error-message pre {color: #ee4444;padding: 4px 0;margin: 0;}#less-error-message pre.ctx {color: #dd7777;}#less-error-message h3 {padding: 15px 0 5px 0;margin: 0;}#less-error-message a {color: #10a}#less-error-message .error {color: red;font-weight: bold;padding-bottom: 2px;border-bottom: 1px dashed red;}");
            K.style.cssText = "font-family: Arial, sans-serif;border: 1px solid #e00;background-color: #eee;border-radius: 5px;color: #e00;padding: 15px;margin-bottom: 15px";
            if (l.env == "development") L = setInterval(function () {
                if (document.body) {
                    document.body.insertBefore(K, document.body.childNodes[0]);
                    clearInterval(L)
                }
            }, 10)
        }
        var t = [];
        l.env = location.hostname == "127.0.0.1" || location.hostname == "0.0.0.0" || location.hostname == "localhost" || location.protocol == "file:" ? "development" : "production";
        var B = setInterval(function () {
            if (document.body) {
                if (!document.querySelectorAll && typeof jQuery === "undefined") j("No selector method found");
                else t = (document.querySelectorAll || jQuery).call(document, 'link[rel="stylesheet/less"]');
                clearInterval(B);
                d(function (C, e, K) {
                    m(C.toCSS(), e, K.lastModified);
                    K.local ? j("less: loading " + e.href + " from local storage.") : j("less: parsed " + e.href + " successfully.")
                })
            }
        }, 10);
        if (l.env === "development") refreshTimer = setInterval(function () {
            /!refresh/.test(location.hash) && d(function (C, e, K) {
                m(C.toCSS(), e, K)
            })
        }, 1E3);l.Parser.importer = function (C, e, K) {
            f({
                href: C,
                title: C
            }, function (L) {
                K(L)
            })
        }
    })()
});
bespin.tiki.register("::theme_manager_base", {
    name: "theme_manager_base",
    dependencies: {}
});
bespin.tiki.module("theme_manager_base:index", function () {});
bespin.tiki.register("::canon", {
    name: "canon",
    dependencies: {
        environment: "0.0.0",
        events: "0.0.0",
        settings: "0.0.0"
    }
});
bespin.tiki.module("canon:history", function (y, s) {
    var v = y("bespin:util/stacktrace").Trace,
        r = y("bespin:plugins").catalog;
    s.requests = [];
    s.addRequestOutput = function (l) {
        for (s.requests.push(l); s.requests.length > 100;) s.requests.shiftObject();
        r.publish(this, "addedRequestOutput", null, l)
    };
    s.execute = function (l, h) {
        if (h.command) try {
            h.command(l, h)
        } catch (d) {
            var f = new v(d, true);
            console.group("Error executing command '" + h.typed + "'");
            console.log("command=", h.commandExt);
            console.log("args=", l);
            console.error(d);
            f.log(3);
            console.groupEnd();
            h.doneWithError(d)
        } else h.doneWithError("Command not found.")
    }
});
bespin.tiki.module("canon:request", function (y, s) {
    var v = y("events").Event,
        r = y("canon:history");
    s.Request = function (l) {
        l = l || {};
        this.command = l.command;
        this.commandExt = l.commandExt;
        this.args = l.args;
        this.typed = l.typed;
        this._begunOutput = false;
        this.start = new Date;
        this.end = null;
        this.error = this.completed = false;
        this.changed = new v
    };
    s.Request.prototype._beginOutput = function () {
        this._begunOutput = true;
        this.outputs = [];
        r.addRequestOutput(this)
    };
    s.Request.prototype.doneWithError = function (l) {
        this.error = true;
        this.done(l)
    };
    s.Request.prototype.async = function () {
        this._begunOutput || this._beginOutput()
    };
    s.Request.prototype.output = function (l) {
        this._begunOutput || this._beginOutput();
        if (typeof l !== "string" && !(l instanceof Node)) l = l.toString();
        this.outputs.push(l);
        this.changed();
        return this
    };
    s.Request.prototype.done = function (l) {
        this.completed = true;
        this.end = new Date;
        this.duration = this.end.getTime() - this.start.getTime();
        l ? this.output(l) : this.changed()
    }
});
bespin.tiki.module("canon:index", function () {});
bespin.tiki.register("::traits", {
    name: "traits",
    dependencies: {}
});
bespin.tiki.module("traits:index", function (y, s) {
    s.Trait = function () {
        function v(O) {
            var P = function () {
                throw new Error("Conflicting property: " + O);
            };
            T(P.prototype);
            return T(P)
        }
        function r() {
            return T({
                value: undefined,
                enumerable: false,
                required: true
            })
        }
        function l(O) {
            O = v(O);
            return n ? T({
                get: O,
                set: O,
                enumerable: false,
                conflict: true
            }) : T({
                value: O,
                enumerable: false,
                conflict: true
            })
        }
        function h(O, P) {
            return O === P ? O !== 0 || 1 / O === 1 / P : O !== O && P !== P
        }
        function d(O, P) {
            return O.conflict && P.conflict ? true : O.get === P.get && O.set === P.set && h(O.value, P.value) && O.enumerable === P.enumerable && O.required === P.required && O.conflict === P.conflict
        }
        function f(O, P) {
            return T(D(O, P))
        }
        function m(O) {
            var P = {};
            Z(O, function (S) {
                P[S] = true
            });
            return T(P)
        }
        function i(O) {
            var P = {};
            Z(ca(O), function (S) {
                var U = ha(O, S);
                if (U.value === na) U = r(S);
                else if (typeof U.value === "function") {
                    U.method = true;
                    "prototype" in U.value && T(U.value.prototype)
                } else {
                    U.get && U.get.prototype && T(U.get.prototype);
                    U.set && U.set.prototype && T(U.set.prototype)
                }
                P[S] = U
            });
            return P
        }
        function g() {
            var O = Q(arguments, 0),
                P = {};
            Z(O, function (S) {
                Z(ca(S), function (U) {
                    var aa = S[U];
                    if (J(P, U) && !P[U].required) aa.required || d(P[U], aa) || (P[U] = l(U));
                    else P[U] = aa
                })
            });
            return T(P)
        }
        function j(O, P) {
            var S = m(O),
                U = {};
            Z(ca(P), function (aa) {
                U[aa] = !J(S, aa) || P[aa].required ? P[aa] : r(aa)
            });
            return T(U)
        }
        function q() {
            var O = Q(arguments, 0),
                P = {};
            Z(O, function (S) {
                Z(ca(S), function (U) {
                    var aa = S[U];
                    if (!J(P, U) || P[U].required) P[U] = aa
                })
            });
            return T(P)
        }
        function t(O, P) {
            var S = {};
            Z(ca(P), function (U) {
                if (J(O, U) && !P[U].required) {
                    var aa = O[U];
                    S[aa] = J(S, aa) && !S[aa].required ? l(aa) : P[U];J(S, U) || (S[U] = r(U))
                } else if (J(S, U)) P[U].required || (S[U] = l(U));
                else S[U] = P[U]
            });
            return T(S)
        }
        function B(O, P) {
            var S = {},
                U = [];
            for (var aa in O) if (J(O, aa)) if (O[aa]) S[aa] = O[aa];
            else U.push(aa);
            return t(S, j(U, P))
        }
        function C(O, P) {
            var S = ma(O),
                U = {};
            Z(ca(P), function (aa) {
                var fa = P[aa];
                if (fa.required && !(aa in O)) throw new Error("Missing required property: " + aa);
                else if (fa.conflict) throw new Error("Remaining conflicting property: " + aa);
                else U[aa] = "value" in fa ? fa.method ? {
                    value: f(fa.value, S),
                    enumerable: fa.enumerable,
                    configurable: fa.configurable,
                    writable: fa.writable
                } : fa : {
                    get: fa.get ? f(fa.get, S) : undefined,
                    set: fa.set ? f(fa.set, S) : undefined,
                    enumerable: fa.enumerable,
                    configurable: fa.configurable,
                    writable: fa.writable
                }
            });
            la(S, U);
            return T(S)
        }
        function e(O, P) {
            return C(Object.prototype, i(O), P)
        }
        function K(O, P) {
            var S = ca(O),
                U = ca(P);
            if (S.length !== U.length) return false;
            for (var aa = 0; aa < S.length; aa++) {
                U = S[aa];
                if (!P[U] || !d(O[U], P[U])) return false
            }
            return true
        }
        function L(O) {
            return i(O)
        }
        var n = !! Object.defineProperty,
            w = Function.prototype.call,
            D = Function.prototype.bind ?
            function (O, P) {
                return Function.prototype.bind.call(O, P)
            } : function (O, P) {
                function S() {
                    return O.apply(P, arguments)
                }
                return S
            },
            J = D(w, Object.prototype.hasOwnProperty),
            Q = D(w, Array.prototype.slice),
            Z = Array.prototype.forEach ? D(w, Array.prototype.forEach) : function (O, P) {
                for (var S = 0, U = O.length; S < U; S++) P(O[S])
            },
            T = Object.freeze ||
            function (O) {
                return O
            },
            ca = Object.getOwnPropertyNames ||
            function (O) {
                var P = [];
                for (var S in O) J(O, S) && P.push(S);
                return P
            },
            ha = Object.getOwnPropertyDescriptor ||
            function (O, P) {
                return {
                    value: O[P],
                    enumerable: true,
                    writable: true,
                    configurable: true
                }
            },
            ga = Object.defineProperty ||
            function (O, P, S) {
                O[P] = S.value
            },
            la = Object.defineProperties ||
            function (O, P) {
                for (var S in P) J(P, S) && ga(O, S, P[S])
            },
            ma = Object.create ||
            function (O, P) {
                function S() {}
                S.prototype = O || Object.prototype;
                O = new S;
                P && la(O, P);
                return O
            };w = Object.getOwnProperties ||
        function (O) {
            var P = {};
            Z(ca(O), function (S) {
                P[S] = ha(O, S)
            });
            return P
        };
        var na = T({
            toString: function () {
                return "<Trait.required>"
            }
        });
        if (!Object.create) Object.create = ma;
        if (!Object.getOwnProperties) 
          Object.getOwnProperties = w;
        L.required = T(na);
        L.compose = T(g);
        L.resolve = T(B);
        L.override = T(q);
        L.create = T(C);
        L.eqv = T(K);
        L.object = T(e);
        return T(L)
    }()
});
bespin.tiki.register("::keyboard", {
    name: "keyboard",
    dependencies: {
        canon: "0.0.0",
        settings: "0.0.0"
    }
});
bespin.tiki.module("keyboard:keyboard", function (y, s) {
    var v = y("bespin:plugins").catalog;
    y("bespin:console");
    y("bespin:util/stacktrace");
    var r = y("bespin:util/util"),
        l = y("settings").settings,
        h = y("keyboard:keyutil"),
        d = y("canon:history"),
        f = y("canon:request").Request,
        m = y("environment").env;
    s.buildFlags = function (i) {
        i.context = m.contexts[0];
        return i
    };
    y = function () {};
    r.mixin(y.prototype, {
        _customKeymappingCache: {
            states: {}
        },
        processKeyEvent: function (i, g, j) {
            i = h.commandCodes(i, true)[0];
            if (r.none(i)) return false;
            s.buildFlags(j);
            j.isCommandKey = true;
            return this._matchCommand(i, g, j)
        },
        _matchCommand: function (i, g, j) {
            var q = this._findCommandExtension(i, g, j);
            if (q && q.commandExt !== "no command") {
                j.isTextView && g.resetKeyBuffers();
                var t = q.commandExt;
                t.load(function (B) {
                    B = new f({
                        command: B,
                        commandExt: t
                    });
                    d.execute(q.args, B)
                });
                return true
            }
            return q && q.commandExt === "no command" ? true : false
        },
        _buildBindingsRegex: function (i) {
            i.forEach(function (g) {
                if (r.none(g.key)) if (Array.isArray(g.regex)) {
                    g.key = new RegExp("^" + g.regex[1] + "$");
                    g.regex =
                    new RegExp(g.regex.join("") + "$")
                } else g.regex = new RegExp(g.regex + "$");
                else g.key = new RegExp("^" + g.key + "$")
            })
        },
        _buildKeymappingRegex: function (i) {
            for (state in i.states) this._buildBindingsRegex(i.states[state]);
            i._convertedRegExp = true
        },
        _findCommandExtension: function (i, g, j) {
            if (j.isTextView) {
                var q = g._keyState;
                if (!j.isCommandKey || i.indexOf("alt_") === -1) {
                    g._keyBuffer += i.replace(/ctrl_meta|meta/, "ctrl");
                    g._keyMetaBuffer += i
                }
                var t = [this._customKeymappingCache];
                t = t.concat(v.getExtensions("keymapping"));
                for (var B =
                0; B < t.length; B++) if (!r.none(t[B].states[q])) {
                    r.none(t[B]._convertedRegExp) && this._buildKeymappingRegex(t[B]);
                    var C = this._bindingsMatch(i, j, g, t[B]);
                    if (!r.none(C)) return C
                }
            }
            g = v.getExtensions("command");
            var e = null;
            q = {};
            i = i.replace(/ctrl_meta|meta/, "ctrl");
            g.some(function (K) {
                if (this._commandMatches(K, i, j)) {
                    e = K;
                    return true
                }
                return false
            }.bind(this));
            return r.none(e) ? null : {
                commandExt: e,
                args: q
            }
        },
        _bindingsMatch: function (i, g, j, q) {
            var t, B = null,
                C = {},
                e;
            e = r.none(q.hasMetaKey) ? j._keyMetaBuffer : j._keyBuffer;
            if (i.indexOf("alt_") === 0 && g.isCommandKey) e += i;q.states[j._keyState].some(function (K) {
                if (K.key && !K.key.test(i)) return false;
                if (K.regex && !(t = K.regex.exec(e))) return false;
                if (K.disallowMatches) for (var L = 0; L < K.disallowMatches.length; L++) if (t[K.disallowMatches[L]]) return true;
                if (!s.flagsMatch(K.predicates, g)) return false;
                if (K.exec) {
                    B = v.getExtensionByKey("command", K.exec);
                    if (r.none(B)) throw new Error("Can't find command " + K.exec + " in state=" + j._keyState + ", symbolicName=" + i);
                    if (K.params) {
                        var n;
                        K.params.forEach(function (w) {
                            n = !r.none(w.match) && !r.none(t) ? t[w.match] || w.defaultValue : w.defaultValue;
                            if (w.type === "number") n = parseInt(n);C[w.name] = n
                        })
                    }
                    j.resetKeyBuffers()
                }
                if (K.then) {
                    j._keyState = K.then;
                    j.resetKeyBuffers()
                }
                if (r.none(B)) B = "no command";
                return true
            });
            if (r.none(B)) return null;
            return {
                commandExt: B,
                args: C
            }
        },
        _commandMatches: function (i, g, j) {
            var q = i.key;
            if (!q) return false;
            if (!s.flagsMatch(i.predicates, j)) return false;
            if (typeof q === "string") {
                if (q != g) return false;
                return true
            }
            if (!Array.isArray(q)) {
                q = [q];
                i.key = q
            }
            for (i = 0; i < q.length; i++) {
                var t = q[i];
                if (typeof t === "string") {
                    if (t == g) return true
                } else if (t.key == g) return s.flagsMatch(t.predicates, j)
            }
            return false
        },
        _customKeymappingChanged: function () {
            var i = this._customKeymappingCache = JSON.parse(l.get("customKeymapping"));
            i.states = i.states || {};
            for (state in i.states) this._buildBindingsRegex(i.states[state]);
            i._convertedRegExp = true
        }
    });
    s.flagsMatch = function (i, g) {
        if (r.none(i)) return true;
        if (!g) return false;
        for (var j in i) if (g[j] !== i[j]) return false;
        return true
    };
    s.keyboardManager = new y;
    v.registerExtension("settingChange", {
        match: "customKeymapping",
        pointer: s.keyboardManager._customKeymappingChanged.bind(s.keyboardManager)
    })
});
bespin.tiki.module("keyboard:keyutil", function (y, s) {
    var v = y("bespin:util/util");
    s.KeyHelper = function () {
        var l = {
            MODIFIER_KEYS: {
                16: "shift",
                17: "ctrl",
                18: "alt",
                224: "meta"
            },
            FUNCTION_KEYS: {
                8: "backspace",
                9: "tab",
                13: "return",
                19: "pause",
                27: "escape",
                33: "pageup",
                34: "pagedown",
                35: "end",
                36: "home",
                37: "left",
                38: "up",
                39: "right",
                40: "down",
                44: "printscreen",
                45: "insert",
                46: "delete",
                112: "f1",
                113: "f2",
                114: "f3",
                115: "f4",
                116: "f5",
                117: "f7",
                119: "f8",
                120: "f9",
                121: "f10",
                122: "f11",
                123: "f12",
                144: "numlock",
                145: "scrolllock"
            },
            PRINTABLE_KEYS: {
                32: " ",
                48: "0",
                49: "1",
                50: "2",
                51: "3",
                52: "4",
                53: "5",
                54: "6",
                55: "7",
                56: "8",
                57: "9",
                59: ";",
                61: "=",
                65: "a",
                66: "b",
                67: "c",
                68: "d",
                69: "e",
                70: "f",
                71: "g",
                72: "h",
                73: "i",
                74: "j",
                75: "k",
                76: "l",
                77: "m",
                78: "n",
                79: "o",
                80: "p",
                81: "q",
                82: "r",
                83: "s",
                84: "t",
                85: "u",
                86: "v",
                87: "w",
                88: "x",
                89: "y",
                90: "z",
                107: "+",
                109: "-",
                110: ".",
                188: ",",
                190: ".",
                191: "/",
                192: "`",
                219: "[",
                220: "\\",
                221: "]",
                222: '"'
            },
            PRINTABLE_KEYS_CHARCODE: {},
            KEY: {}
        };
        for (var h in l.PRINTABLE_KEYS) {
            var d = l.PRINTABLE_KEYS[h];
            l.PRINTABLE_KEYS_CHARCODE[d.charCodeAt(0)] = h;
            if (d.toUpperCase() != d) l.PRINTABLE_KEYS_CHARCODE[d.toUpperCase().charCodeAt(0)] = h
        }
        for (h in l.FUNCTION_KEYS) {
            d = l.FUNCTION_KEYS[h].toUpperCase();
            l.KEY[d] = parseInt(h, 10)
        }
        return l
    }();
    var r = function (l) {
        return !!(l.altKey || l.ctrlKey || l.metaKey || l.charCode !== l.which && s.KeyHelper.FUNCTION_KEYS[l.which])
    };
    s.commandCodes = function (l, h) {
        var d = l._keyCode || l.keyCode,
            f = l._charCode === undefined ? l.charCode : l._charCode,
            m = null,
            i = null,
            g = "",
            j = true;
        if (d === 0 && l.which === 0) return false;
        if (f !== 0) return false;
        if (s.KeyHelper.MODIFIER_KEYS[f]) return [s.KeyHelper.MODIFIER_KEYS[f], null];
        if (d) {
            m = s.KeyHelper.FUNCTION_KEYS[d];
            if (!m && (l.altKey || l.ctrlKey || l.metaKey)) {
                m = s.KeyHelper.PRINTABLE_KEYS[d];
                if (d > 47 && d < 58) j = l.altKey
            }
            if (m) {
                if (l.altKey) g += "alt_";
                if (l.ctrlKey) g += "ctrl_";
                if (l.metaKey) g += "meta_"
            } else if (l.ctrlKey || l.metaKey) return false
        }
        if (!m) {
            d = l.which;
            i = m = String.fromCharCode(d);
            d = m.toLowerCase();
            if (l.metaKey) {
                g = "meta_";
                m = d
            } else m = null
        }
        if (l.shiftKey && m && j) g += "shift_";
        if (m) m = g + m;
        if (!h && m) m = m.replace(/ctrl_meta|meta/, "ctrl");
        return [m, i]
    };
    s.addKeyDownListener = function (l, h) {
        var d =

        function (f) {
            var m = h(f);
            m && v.stopEvent(f);
            return m
        };
        l.addEventListener("keydown", function (f) {
            if (v.isMozilla) if (s.KeyHelper.FUNCTION_KEYS[f.keyCode]) return true;
            else if ((f.ctrlKey || f.metaKey) && s.KeyHelper.PRINTABLE_KEYS[f.keyCode]) return true;
            if (r(f)) return d(f);
            return true
        }, false);
        l.addEventListener("keypress", function (f) {
            if (v.isMozilla) if (s.KeyHelper.FUNCTION_KEYS[f.keyCode]) return d(f);
            else if ((f.ctrlKey || f.metaKey) && s.KeyHelper.PRINTABLE_KEYS_CHARCODE[f.charCode]) {
                f._keyCode = s.KeyHelper.PRINTABLE_KEYS_CHARCODE[f.charCode];
                f._charCode = 0;
                return d(f)
            }
            if (f.charCode !== undefined && f.charCode === 0) return true;
            return d(f)
        }, false)
    }
});
bespin.tiki.module("keyboard:index", function () {});
bespin.tiki.register("::worker_manager", {
    name: "worker_manager",
    dependencies: {
        canon: "0.0.0",
        events: "0.0.0",
        underscore: "0.0.0"
    }
});
bespin.tiki.module("worker_manager:index", function (y, s) {
    function v(g) {
        var j = /^([^#:]+)(?::([^#:]+))?#([^#:]+)$/.exec(g);
        if (j == null) throw new Error('WorkerSupervisor: invalid pointer specification: "' + g + '"');
        g = j[1];
        var q = j[3];
        j = g + ":" + (j[2] != null ? j[2] : "index");
        var t = bespin != null && bespin.base != null ? bespin.base : "";this._packageId = g;this._moduleId = j;this._base = t;this._target = q;this._worker = null;this._currentId = 0;this.started = new f
    }
    function r() {
        i.restartAll()
    }
    if (window == null) throw new Error('The "worker_manager" plugin can only be loaded in the browser, not a web worker. Use "worker" instead.');
    var l = y("bespin:proxy");
    y("bespin:plugins");
    var h = y("bespin:console").console,
        d = y("underscore")._,
        f = y("events").Event,
        m = y("bespin:promise").Promise;
    y("environment");
    var i = {
        _workers: [],
        add: function (g) {
            this._workers.push(g)
        },
        remove: function (g) {
            this._workers = d(this._workers).without(g)
        },
        restartAll: function () {
            var g = this._workers;
            d(g).invoke("kill");
            d(g).invoke("start")
        }
    };
    v.prototype = {
        _onError: function (g) {
            this._worker = null;
            i.remove(this);
            h.error("WorkerSupervisor: worker failed at file " + g.filename + ":" + g.lineno + "; fix the worker and use 'worker restart' to restart it")
        },
        _onMessage: function (g) {
            g = JSON.parse(g.data);
            switch (g.op) {
            case "finish":
                if (g.id === this._currentId) {
                    var j = this._promise;
                    this._promise = null;
                    j.resolve(g.result)
                }
                break;
            case "log":
                h[g.method].apply(h, g.args);
                break
            }
        },
        _promise: null,
        started: null,
        kill: function () {
            var g = this._promise;
            if (g != null) {
                g.reject("killed");
                this._promise = null
            }
            this._worker.terminate();
            this._worker = null;
            i.remove(this)
        },
        send: function (g, j) {
            var q = this._promise;
            if (q != null) {
                q.reject("interrupted");
                this._currentId++
            }
            q = this._currentId;
            var t = new m;
            this._promise = t;
            this._worker.postMessage(JSON.stringify({
                op: "invoke",
                id: q,
                method: g,
                args: j
            }));
            return t
        },
        start: function () {
            if (this._worker != null) throw new Error("WorkerSupervisor: worker already started");
            var g = this._base,
                j = this._target,
                q = this._packageId,
                t = this._moduleId,
                B = new l.Worker(g + "BespinEmbedded.js");
            B.onmessage = this._onMessage.bind(this);
            B.onerror = this._onError.bind(this);
            B.postMessage(JSON.stringify({
                op: "load",
                base: g,
                pkg: q,
                module: t,
                target: j
            }));
            this._worker = B;
            this._currentId = 0;
            i.add(this);
            this.started()
        }
    };
    s.WorkerSupervisor = v;
    s.workerManager = i;
    s.workerRestartCommand = r
});
bespin.tiki.register("::edit_session", {
    name: "edit_session",
    dependencies: {
        events: "0.0.0"
    }
});
bespin.tiki.module("edit_session:index", function (y, s) {
    y("bespin:promise");
    y("bespin:plugins");
    y("bespin:util/util");
    y("events");
    s.EditSession = function () {};
    s.EditSession.prototype = {
        _currentView: null,
        currentUser: null,
        history: null,
        getCompletePath: function (v) {
            if (v == null) v = "";
            if (v == null || v.substring(0, 1) != "/") {
                var r;
                if (this._currentView && this._currentView.buffer) r = this._currentView.buffer;
                var l;
                if (r) l = r.file;
                v = l ? l.parentdir() + v : "/" + v
            }
            return v
        }
    };
    Object.defineProperties(s.EditSession.prototype, {
        currentView: {
            set: function (v) {
                if (v !== this._currentView) this._currentView = v
            },
            get: function () {
                return this._currentView
            }
        }
    });
    s.createSession = function (v, r) {
        var l = new s.EditSession;
        if (v) l.currentView = v.textView;
        if (r) l.currentUser = r;
        return l
    }
});
bespin.tiki.register("::syntax_manager", {
    name: "syntax_manager",
    dependencies: {
        worker_manager: "0.0.0",
        events: "0.0.0",
        underscore: "0.0.0",
        syntax_directory: "0.0.0"
    }
});
bespin.tiki.module("syntax_manager:index", function (y, s) {
    function v(g, j, q, t) {
        for (; g.length < j;) g.push(d(t).clone());
        j = [j, q.length].concat(q);
        Array.prototype.splice.apply(g, j);
        return g
    }
    function r() {
        this._lines = [];
        this._syms = {}
    }
    function l(g, j) {
        this._syntaxInfo = g;
        this._syntaxManager = j;
        this._invalidRow = 0;
        this._states = [];
        this._active = false;
        this.symbols = new r
    }
    function h(g) {
        this.layoutManager = g;
        this.attrsChanged = new f;
        this.syntaxChanged = new f;
        this._contextRanges = this._invalidRows = this._context = null;
        this._attrs = [];
        this._symbols = new r;
        this._syntax = "plain";
        this._reset()
    }
    var d = y("underscore")._,
        f = y("events").Event,
        m = y("worker_manager").WorkerSupervisor;
    y("bespin:console");
    y("rangeutils:utils/range");
    var i = y("syntax_directory").syntaxDirectory;
    r.prototype = {
        get: function (g) {
            return this._syms["-" + g]
        },
        replaceLine: function (g, j) {
            function q(C) {
                return C.substring(1)
            }
            var t = this._lines,
                B = this._syms;
            g < t.length && d(t[g]).isArray() && d(t[g]).each(function (C) {
                delete B["-" + C]
            });
            t[g] = d(j).keys().map(q);
            d(B).extend(j)
        }
    };
    l.prototype = {
        _annotate: function () {
            if (this._invalidRow == null) throw new Error("syntax_manager.Context: attempt to annotate without any invalid row");
            if (!this._active) throw new Error("syntax_manager.Context: attempt to annotate while inactive");
            if (this._worker == null) this._createWorker();
            else {
                var g = this._syntaxManager.getTextLines(),
                    j = this._invalidRow,
                    q = j === 0 ? this.getName() + ":start" : this._states[j],
                    t = Math.min(g.length, j + 100);g = g.slice(j, t);
                var B = {
                    start: {
                        row: j,
                        col: 0
                    },
                    end: {
                        row: t - 1,
                        col: d(g).last().length
                    }
                };this._worker.send("annotate", [q, g, B]).then(d(this._annotationFinished).bind(this, j, t))
            }
        },
        _annotationFinished: function (g, j, q) {
            if (this._active) {
                var t = this._syntaxManager;
                t.mergeAttrs(g, q.attrs);
                t.mergeSymbols(g, q.symbols);
                v(this._states, g, q.states);
                if (j >= this._getRowCount()) {
                    this._invalidRow = null;
                    this._active = false
                } else {
                    this._invalidRow = j;
                    this._annotate()
                }
            }
        },
        _createWorker: function () {
            if (this._syntaxInfo == null) return false;
            var g = new m("syntax_worker#syntaxWorker");
            this._worker = g;
            g.started.add(this._workerStarted.bind(this));
            g.start();
            return true
        },
        _getRowCount: function () {
            return this._syntaxManager.getTextLines().length
        },
        _workerStarted: function () {
            this._worker.send("loadSyntax", [this._syntaxInfo.name]);
            this._active && this._annotate()
        },
        activateAndAnnotate: function () {
            this._active = true;
            this._annotate()
        },
        contextsAtPosition: function () {
            var g = this._syntaxInfo;
            if (g == null) return ["plain"];
            return [g.name]
        },
        cut: function (g) {
            var j = this._getRowCount();
            if (g < 0 || g >= j) throw new Error("Attempt to cut the context at an invalid row");
            if (!(this._invalidRow != null && this._invalidRow < g)) {
                this._invalidRow = g;
                this._active = false
            }
        },
        getName: function () {
            return this._syntaxInfo.name
        },
        kill: function () {
            var g = this._worker;
            if (g != null) {
                g.kill();
                this._worker = null
            }
        }
    };
    h.prototype = {
        _getTextStorage: function () {
            return this.layoutManager.textStorage
        },
        _reset: function () {
            var g = this._context;
            if (g != null) {
                g.kill();
                this._context = null
            }
            g = this._syntax;
            g = g === "plain" ? null : i.get(g);this._context = g = new l(g, this);g.activateAndAnnotate()
        },
        attrsChanged: null,
        syntaxChanged: null,
        contextsAtPosition: function (g) {
            return this._context.contextsAtPosition(g)
        },
        getAttrsForRows: function (g, j) {
            return this._attrs.slice(g, j)
        },
        getSymbol: function (g) {
            return this._symbols.get(g)
        },
        getSyntax: function () {
            return this._syntax
        },
        getTextLines: function () {
            return this._getTextStorage().lines
        },
        invalidateRow: function (g) {
            var j = this._context;
            j.cut(g);
            j.activateAndAnnotate()
        },
        mergeAttrs: function (g, j) {
            v(this._attrs, g, j, []);
            this.attrsChanged(g, g + j.length)
        },
        mergeSymbols: function (g, j) {
            var q = this._symbols;
            d(j).each(function (t, B) {
                q.replaceLine(g + B, t)
            })
        },
        setSyntax: function (g) {
            this._syntax =
            i.hasSyntax(g) ? g : "plain";this.syntaxChanged(g);this._reset()
        },
        setSyntaxFromFileExt: function (g) {
            return this.setSyntax(i.syntaxForFileExt(g))
        }
    };
    s.SyntaxManager = h
});
bespin.tiki.register("::completion", {
    name: "completion",
    dependencies: {
        jquery: "0.0.0",
        ctags: "0.0.0",
        rangeutils: "0.0.0",
        canon: "0.0.0",
        underscore: "0.0.0"
    }
});
bespin.tiki.module("completion:controller", function (y, s) {
    function v(i) {
        this._editorView = i;
        i.selectionChanged.add(this._selectionChanged.bind(this));
        i.willChangeBuffer.add(this._willChangeBuffer.bind(this));
        this._syntaxChanged = this._syntaxChanged.bind(this);
        this.tags = new l.Tags;
        this.ui = new d(i.element)
    }
    function r(i) {
        return function () {
            return m.editor.completionController[i](m)
        }
    }
    var l = y("ctags"),
        h = y("rangeutils:utils/range"),
        d = y("completion:ui").CompletionUI,
        f = y("bespin:plugins").catalog,
        m = y("environment").env;
    v.prototype = {
        _buffer: null,
        _completionEngine: null,
        _completions: null,
        _stem: null,
        _hideCompletions: function () {
            this.ui.hide()
        },
        _selectionChanged: function (i) {
            var g = this._completionEngine;
            if (!(g == null || !h.isZeroLength(i))) {
                var j = this._buffer.layoutManager,
                    q = j.syntaxManager,
                    t = i.start;
                i = t.col;
                t = j.textStorage.lines[t.row];
                j = t.substring(0, i);
                i = t.substring(i);
                g = g.getCompletions(j, i, q);
                if (g == null) this._hideCompletions();
                else {
                    q = g.tags;
                    this._stem = g.stem;
                    this._showCompletions(q)
                }
            }
        },
        _showCompletions: function (i) {
            var g =
            this._editorView,
                j = g.textView.getInsertionPointPosition();
            j = g.convertTextViewPoint(j);
            this.ui.show(i, j, g.layoutManager.fontDimension.lineHeight)
        },
        _syntaxChanged: function (i) {
            i = f.getExtensionByKey("completion", i);
            if (i == null) this._completionEngine = null;
            else i.load().then(function (g) {
                this._completionEngine = new g(this.tags)
            }.bind(this))
        },
        _willChangeBuffer: function (i) {
            var g = this._buffer;
            g != null && g.layoutManager.syntaxManager.syntaxChanged.remove(this._syntaxChanged);
            i.layoutManager.syntaxManager.syntaxChanged.add(this._syntaxChanged);
            this._buffer = i
        },
        cancel: function () {
            this.ui.hide()
        },
        complete: function (i) {
            var g = this.ui,
                j = g.getCompletion().name;
            i.view.insertText(j.substring(this._stem.length));
            g.hide()
        },
        isCompleting: function () {
            return this.ui.visible
        },
        moveDown: function () {
            this.ui.move("down")
        },
        moveUp: function () {
            this.ui.move("up")
        },
        tags: null
    };
    s.CompletionController = v;
    s.completeCommand = r("complete");
    s.completeCancelCommand = r("cancel");
    s.completeDownCommand = r("moveDown");
    s.completeUpCommand = r("moveUp")
});
bespin.tiki.module("completion:ui", function (y, s) {
    function v(m) {
        var i = l.uniqueId("bespin-completion-panel"),
            g = document.createElement("div");
        g.id = i;
        g.className = "bespin-completion-panel";
        g.style.display = "none";
        g.innerHTML = '<div class="bespin-completion-pointer"></div><div class="bespin-completion-bubble-outer"><div class="bespin-completion-bubble-inner"><div class="bespin-completion-highlight"></div><ul></ul></div></div>';
        r(m).append(g);
        this.panel = r(g);
        this.parent = r(m)
    }
    var r = y("jquery").$,
        l = y("underscore")._,
        h = l.template('<span class="bespin-completion-container"> &mdash; <%= container %></span>'),
        d = l.template('<div class="bespin-completion-second-row"><%= type %></div>'),
        f = l.template('<li><div class="bespin-completion-top-row"><span class="bespin-completion-kind bespin-completion-kind-<%= kind %>"><%= kind %></span><span class="bespin-completion-ident"><%= ident %></span><%= container %></div><%= second_row %></li>');
    v.prototype = {
        _fromBottom: false,
        _index: 0,
        _tags: null,
        _getHighlightDimensions: function (m) {
            var i =
            m.position(),
                g = m.outerHeight() - 2;
            m = m.outerWidth() - 2;
            return {
                left: i.left,
                top: i.top,
                height: g,
                width: m
            }
        },
        _listItemForIndex: function (m) {
            return this.panel.find("li:eq(" + m + ")")
        },
        _populate: function () {
            var m = l(this._tags).map(function (i) {
                var g = i["class"],
                    j = i.module,
                    q = i.namespace;
                g = g != null ? g : q != null ? q : "";
                if (j != null) g = j + (g != "" ? "#" + g : "");j = g == "" ? "" : h({
                    container: g
                });g = i.type;g = g == null ? "" : d({
                    type: g
                });
                return f({
                    kind: i.kind,
                    ident: i.name,
                    container: j,
                    second_row: g
                })
            });
            this.panel.find("ul").html(m.join("\n"))
        },
        panel: null,
        visible: false,
        getCompletion: function () {
            return this.visible ? this._tags[this._index] : null
        },
        hide: function () {
            if (this.visible) {
                this.panel.fadeOut(100);
                this.visible = false
            }
        },
        move: function (m) {
            var i = this._index,
                g = this._listItemForIndex(i),
                j = m === "up" ? g.prev() : g.next();
            if (j.length !== 0) {
                this._index = i = m === "up" ? i - 1 : i + 1;i = r(g).find(".bespin-completion-top-row");
                var q = r(g).find(".bespin-completion-second-row");g = r(j).find(".bespin-completion-top-row");
                var t = r(j).find(".bespin-completion-second-row");q.hide();t.show();
                var B = this.panel.find(".bespin-completion-highlight");B.stop(true, true);j = this._getHighlightDimensions(j);B.animate(j, 100);t.hide();
                if (m === "down") {
                    m = q.height();
                    g.css("top", m);
                    g.animate({
                        top: 0
                    }, 100)
                } else {
                    m = t.height();
                    i.css("top", -m);
                    i.animate({
                        top: 0
                    }, 100)
                }
                t.fadeIn()
            }
        },
        show: function (m, i, g) {
            this._tags = m = l(m).clone();
            this._populate();
            var j = this.visible,
                q = this.panel;
            q.stop(true, true);
            j || q.show();
            var t = this.parent.offset(),
                B = t.left,
                C = B + i.x,
                e = t.top + i.y;
            t = q.outerWidth();
            var K = q.outerHeight(),
                L = r(window).width(),
                n = r(window).height();
            this._fromBottom = e = e + K + g > n;
            if (this._index >= m.length) this._index = m.length - 1;
            if (e) {
                e = q.find(".bespin-completion-pointer");
                e.removeClass("bespin-completion-pointer-up");
                e.addClass("bespin-completion-pointer-down");
                q.css({
                    bottom: -i.y,
                    top: ""
                });
                this._tags.reverse();
                this._populate();
                if (!j) this._index = m.length - 1
            } else {
                e = q.find(".bespin-completion-pointer");
                e.removeClass("bespin-completion-pointer-down");
                e.addClass("bespin-completion-pointer-up");
                q.css({
                    top: i.y + g,
                    bottom: ""
                });
                if (!j) this._index = 0
            }
            if (!j) {
                if (C + i.x + t > L) {
                    e.css({
                        left: "",
                        right: 32
                    });
                    q.css("left", Math.min(L - t - B, i.x - t + 43))
                } else {
                    e.css({
                        left: 32,
                        right: ""
                    });
                    q.css("left", Math.max(B, i.x - 43))
                }
                q.hide().animate({
                    opacity: "show"
                }, 100)
            }
            m = q.find(".bespin-completion-highlight");
            m.stop(true, true);
            i = this._listItemForIndex(this._index);
            i.find(".bespin-completion-second-row").show();
            i = this._getHighlightDimensions(i);
            m.css(i);
            this.visible = true
        }
    };
    s.CompletionUI = v
});
bespin.tiki.module("completion:index", function () {});
bespin.tiki.register("::rangeutils", {
    name: "rangeutils",
    dependencies: {}
});
bespin.tiki.module("rangeutils:utils/range", function (y, s) {
    var v = y("bespin:util/util");
    s.addPositions = function (r, l) {
        return {
            row: r.row + l.row,
            col: r.col + l.col
        }
    };
    s.cloneRange = function (r) {
        var l = r.start;
        r = r.end;
        return {
            start: {
                row: l.row,
                col: l.col
            },
            end: {
                row: r.row,
                col: r.col
            }
        }
    };
    s.comparePositions = function (r, l) {
        var h = r.row - l.row;
        return h === 0 ? r.col - l.col : h
    };
    s.equal = function (r, l) {
        return s.comparePositions(r.start, l.start) === 0 && s.comparePositions(r.end, l.end) === 0
    };
    s.extendRange = function (r, l) {
        var h = r.end;
        return {
            start: r.start,
            end: {
                row: h.row + l.row,
                col: h.col + l.col
            }
        }
    };
    s.intersectRangeSets = function (r, l) {
        r = v.clone(r);
        l = v.clone(l);
        for (var h = []; r.length > 0 && l.length > 0;) {
            var d = r.shift(),
                f = l.shift(),
                m = s.comparePositions(d.start, f.start),
                i = s.comparePositions(d.end, f.end);
            if (s.comparePositions(d.end, f.start) < 0) {
                h.push(d);
                l.unshift(f)
            } else if (s.comparePositions(f.end, d.start) < 0) {
                h.push(f);
                r.unshift(d)
            } else if (m < 0) {
                h.push({
                    start: d.start,
                    end: f.start
                });
                r.unshift({
                    start: f.start,
                    end: d.end
                });
                l.unshift(f)
            } else if (m === 0) if (i < 0) l.unshift({
                start: d.end,
                end: f.end
            });
            else i > 0 && r.unshift({
                start: f.end,
                end: d.end
            });
            else if (m > 0) {
                h.push({
                    start: f.start,
                    end: d.start
                });
                r.unshift(d);
                l.unshift({
                    start: d.start,
                    end: f.end
                })
            }
        }
        return h.concat(r, l)
    };
    s.isZeroLength = function (r) {
        return r.start.row === r.end.row && r.start.col === r.end.col
    };
    s.maxPosition = function (r, l) {
        return s.comparePositions(r, l) > 0 ? r : l
    };
    s.normalizeRange = function (r) {
        return this.comparePositions(r.start, r.end) < 0 ? r : {
            start: r.end,
            end: r.start
        }
    };
    s.rangeSetBoundaries = function (r) {
        return {
            start: r[0].start,
            end: r[r.length - 1].end
        }
    };
    s.toString = function (r) {
        var l = r.start;
        r = r.end;
        return "[ " + l.row + ", " + l.col + " " + r.row + "," + +r.col + " ]"
    };
    s.unionRanges = function (r, l) {
        return {
            start: r.start.row < l.start.row || r.start.row === l.start.row && r.start.col < l.start.col ? r.start : l.start,
            end: r.end.row > l.end.row || r.end.row === l.end.row && r.end.col > l.end.col ? r.end : l.end
        }
    };
    s.isPosition = function (r) {
        return !v.none(r) && !v.none(r.row) && !v.none(r.col)
    };
    s.isRange = function (r) {
        return !v.none(r) && s.isPosition(r.start) && s.isPosition(r.end)
    }
});
bespin.tiki.module("rangeutils:index", function () {});
bespin.tiki.register("::undomanager", {
    name: "undomanager",
    dependencies: {}
});
bespin.tiki.module("undomanager:index", function (y, s) {
    var v = y("bespin:util/util");
    y("environment");
    s.UndoManager = function () {};
    v.mixin(s.UndoManager.prototype, {
        _redoStack: [],
        _undoStack: [],
        _undoOrRedo: function (r, l, h) {
            if (l.length === 0) return false;
            l = l.pop();
            if (!l.target[r](l.context)) {
                this._redoStack = [];
                this._undoStack = [];
                return false
            }
            h.push(l);
            return true
        },
        redo: function () {
            return this._undoOrRedo("redo", this._redoStack, this._undoStack)
        },
        registerUndo: function (r, l) {
            this._redoStack = [];
            this._undoStack.push({
                target: r,
                context: l
            })
        },
        undo: function () {
            return this._undoOrRedo("undo", this._undoStack, this._redoStack)
        }
    });
    s.global = new s.UndoManager;
    s.undoManagerCommand = function (r, l) {
        s.global[l.commandExt.name]()
    }
});
bespin.tiki.register("::environment", {
    name: "environment",
    dependencies: {
        settings: "0.0.0"
    }
});
bespin.tiki.module("environment:index", function (y, s) {
    var v = y("bespin:util/util"),
        r = y("bespin:console").console,
        l = y("bespin:plugins").catalog,
        h = y("settings").settings;
    s.Environment = function () {
        this.commandLine = null;
        window.addEventListener("resize", this.dimensionsChanged.bind(this), false)
    };
    Object.defineProperties(s.Environment.prototype, {
        settings: {
            value: {
                set: function (d, f) {
                    if (v.none(d)) throw new Error("setSetting(): key must be supplied");
                    if (v.none(f)) throw new Error("setSetting(): value must be supplied");
                    h.set(d, f)
                },
                get: function (d) {
                    if (v.none(d)) throw new Error("getSetting(): key must be supplied");
                    return h.get(d)
                }
            }
        },
        dimensionsChanged: {
            value: function () {
                l.publish(this, "dimensionsChanged")
            }
        },
        session: {
            get: function () {
                return l.getObject("session")
            }
        },
        view: {
            get: function () {
                if (!this.session) return null;
                return this.session.currentView
            }
        },
        editor: {
            get: function () {
                if (!this.session) return null;
                return this.session.currentView.editor
            }
        },
        contexts: {
            get: function () {
                if (!this.view) return [];
                var d = this.view.editor.layoutManager.syntaxManager,
                    f = this.view.getSelectedRange().start;
                return d.contextsAtPosition(f)
            }
        },
        buffer: {
            get: function () {
                if (this.session) return this.view.editor.buffer;
                else r.error("command attempted to get buffer but there's no session")
            }
        },
        model: {
            get: function () {
                if (this.buffer) return this.view.editor.layoutManager.textStorage;
                else r.error("Session has no current buffer")
            }
        },
        file: {
            get: function () {
                if (this.buffer) return this.buffer.file;
                else r.error("Session has no current buffer")
            }
        },
        files: {
            get: function () {
                return l.getObject("files")
            }
        }
    });
    s.env = new s.Environment
});
bespin.tiki.register("::ctags", {
    name: "ctags",
    dependencies: {
        traits: "0.0.0",
        underscore: "0.0.0"
    }
});
bespin.tiki.module("ctags:index", function (y, s) {
    var v = y("underscore")._,
        r = y("./reader").TagReader;
    y = y("traits").Trait;
    s.Tags = function () {
        this.tags = []
    };
    s.Tags.prototype = Object.create(Object.prototype, y.compose(y({
        _search: function (l, h) {
            var d = {
                name: l
            };
            l = this.tags;
            var f = v(l).sortedIndex(d, function (m) {
                return m.name
            });
            for (f = d = f; d >= 0 && d < l.length && h(l[d]);) d--;
            for (; f >= 0 && f < l.length && h(l[f]);) f++;
            return l.slice(d + 1, f)
        },
        add: function (l) {
            var h = this.tags;
            Array.prototype.push.apply(h, l);
            h.sort(function (d, f) {
                d = d.name;
                f = f.name;
                if (d < f) return -1;
                if (d === f) return 0;
                return 1
            })
        },
        get: function (l) {
            return this._search(l, function (h) {
                return h.name === l
            })
        },
        scan: function (l, h, d) {
            if (d === null || d === undefined) d = {};
            var f = l.split("\n");
            l = parse(l, h, 1);
            h = new Interpreter(l, h, f, d);
            h.interpret();
            this.add(h.tags)
        },
        stem: function (l) {
            var h = l.length;
            return this._search(l, function (d) {
                return d.name.substring(0, h) === l
            })
        }
    }), r))
});
bespin.tiki.module("ctags:reader", function (y, s) {
    var v = y("underscore")._;
    y = y("traits").Trait;
    s.TagReader = y({
        readLines: function (r) {
            var l = [];
            v(r).each(function (h) {
                h = h.split("\t");
                if (!(h.length < 3)) {
                    var d = h[0];
                    if (!/^!_TAG_/.test(d)) {
                        d = {
                            name: d,
                            tagfile: h[1],
                            addr: h[2]
                        };
                        var f;
                        if (h.length > 3 && h[3].indexOf(":") === -1) {
                            d.kind = h[3];
                            f = 4
                        } else f = 3;
                        var m = {};
                        v(h.slice(f)).each(function (i) {
                            i = /^([^:]+):(.*)/.exec(i);
                            m[i[1]] = i[2]
                        });
                        d.fields = m;
                        l.push(d)
                    }
                }
            });
            this.add(l)
        },
        readString: function (r) {
            this.readLines(r.split("\n"))
        }
    })
});
bespin.tiki.register("::theme_manager", {
    name: "theme_manager",
    dependencies: {
        theme_manager_base: "0.0.0",
        settings: "0.0.0",
        events: "0.0.0",
        less: "0.0.0"
    }
});
bespin.tiki.module("theme_manager:index", function (y, s) {
    y("bespin:promise");
    var v = y("bespin:plugins").catalog;
    y("events");
    var r = y("themestyles"),
        l = y("settings").settings,
        h = null,
        d = null;
    s.themestyles = r;
    s.themeSettingChanged = function (f, m, i) {
        var g = v.getExtensionByKey("theme", i);
        if (i === "standard" || !i || !g) {
            g = null;
            if (d !== null) g = v.getExtensionByKey("theme", d)
        }
        if (g) g.load().then(function (j) {
            h && r.unregisterThemeStyles(h);
            r.currentThemeVariables = j();
            h = g;
            r.parseGlobalVariables();
            r.reparse();
            g.url && r.registerThemeStyles(g);
            v.publish(s, "themeChange")
        });
        else if (h) {
            r.unregisterThemeStyles(h);
            h = null;
            r.currentThemeVariables = null;
            r.parseGlobalVariables();
            r.reparse();
            v.publish(this, "themeChange")
        }
    };
    v.registerExtension("settingChange", {
        match: "theme",
        pointer: s.themeSettingChanged.bind(s)
    });
    s.setStandardTheme = function (f) {
        d = f;
        f !== l.get("theme") && s.themeSettingChanged(this)
    };
    s.setBasePlugin = function (f) {
        r.basePluginName = f
    };
    s.startParsing = function () {
        r.preventParsing = false;
        return r.reparse()
    };
    s.registerTheme = function (f) {
        var m = l.get("theme");
        f.name === m && s.themeSettingChanged(this, "theme", f.name)
    };
    s.unregisterTheme = function (f) {
        f.name === l.get("theme") && s.themeSettingChanged(this)
    };
    s.appLaunched = function () {
        v.publish(s, "themeChange")
    }
});
bespin.tiki.module("theme_manager:themestyles", function (y, s) {
    var v = y("bespin:util/util"),
        r = y("bespin:plugins").catalog,
        l = y("bespin:console").console,
        h = y("bespin:promise").Promise,
        d = y("bespin:promise").group,
        f = y("bespin:proxy"),
        m = new(y("less").Parser)({
            optimization: 3
        }),
        i = 1;
    s.currentThemeVariables = null;
    s.basePluginName = null;
    s.preventParsing = true;
    var g = "";
    s.globalThemeVariables = {};
    var j = {},
        q = {},
        t = function (w) {
            var D = {},
                J = [],
                Q = function (Z, T) {
                    J.push(Z);
                    if (typeof T != "object") D[J.join("_")] = T;
                    else for (prop in T) Q(prop, T[prop]);
                    J.pop()
                };
            Q("global", w);
            return D
        },
        B = {},
        C = {
            font: "arial, lucida, helvetica, sans-serif",
            font_size: "14px",
            line_height: "1.8em",
            color: "#DAD4BA",
            text_shadow: "1px 1px rgba(0, 0, 0, 0.4)",
            error_color: "#F99",
            header_color: "white",
            link_color: "#ACF",
            control: {
                color: "#E1B41F",
                border: "1px solid rgba(0, 0, 0, 0.2)",
                border_radius: "0.25em",
                background: "rgba(0, 0, 0, 0.2)",
                active: {
                    color: "#FF9600",
                    border: "1px solid #E1B41F",
                    inset_color: "#ff9600",
                    background: "rgba(0, 0, 0, 0.2)"
                }
            },
            pane: {
                h1: {
                    font: "'MuseoSans', Helvetica",
                    font_size: "2.8em",
                    color: "white"
                },
                color: "#DAD4BA",
                text_shadow: "1px 1px rgba(0, 0, 0, 0.4)",
                link_color: "white",
                background: "#45443C",
                border_radius: ".5em"
            },
            form: {
                color: "white",
                text_shadow: "1px 1px rgba(0, 0, 0, 0.4)",
                font: "'Lucida Sans','Lucida Grande',Verdana,Arial,sans-serif",
                font_size: "@global_font_size",
                line_height: "@global_line_height"
            },
            button: {
                color: "white",
                background: "#3E6CB9"
            },
            container: {
                background: "#1E1916",
                border: "1px solid black"
            },
            selectable: {
                color: "white",
                border: "0px solid transparent",
                background: "transparent",
                active: {
                    color: "black",
                    border: "0px solid transparent",
                    background: "#FF8E00"
                },
                hover: {
                    color: "black",
                    border: "0px solid transparent",
                    background: "#FF8E00"
                }
            },
            hint: {
                color: "#AAA",
                active: {
                    color: "black"
                },
                hover: {
                    color: "black"
                }
            },
            accelerator: {
                color: "#996633",
                active: {
                    color: "black"
                },
                hover: {
                    color: "black"
                }
            },
            menu: {
                border_color: "black",
                inset_color_right: "#1E1916",
                inset_color_top_left: "#3E3936",
                background: "transparent"
            }
        };
    C = t(C);
    s.getPluginThemeVariables = function (w) {
        var D = r.plugins[w];
        if (!D) return null;
        var J = {};
        if (s.currentThemeVariables && s.currentThemeVariables[w]) J = s.currentThemeVariables[w];
        D.provides.forEach(function (Q) {
            if (Q.ep === "themevariable") {
                var Z = Q.name;
                J[Z] = J[Z] || Q.defaultValue
            }
        });
        return J
    };
    s.parseGlobalVariables = function () {
        var w = {},
            D = "",
            J = s.currentThemeVariables;
        v.mixin(w, C);
        J && J.global && v.mixin(w, t(J.global));
        s.globalThemeVariables = w;
        for (prop in w) D += "@" + prop + ":" + w[prop] + ";";
        g = D
    };
    s.parseGlobalVariables();
    var e = function (w, D, J) {
        if (j[D]) styleElem = document.getElementById("_bespin_theme_style_" + j[D]);
        else {
            styleElem = document.createElement("style");
            styleElem.setAttribute("id", "_bespin_theme_style_" + i);
            j[D] = i;
            i++;
            document.body.appendChild(styleElem)
        }
        m.parse(g + J + q[D], function (Q, Z) {
            if (Q) {
                Q = "Error less parsing " + D + " " + Q.message;
                l.error(Q);
                w.reject(Q)
            } else {
                try {
                    var T = Z.toCSS()
                } catch (ca) {
                    Q = "Error less parsing " + D + " " + ca;
                    l.error(Q);
                    w.reject(Q);
                    return
                }
                if (styleElem && styleElem.firstChild) styleElem.firstChild.textContent = T;
                else {
                    Q = document.createTextNode(T);
                    styleElem.appendChild(Q)
                }
                w.resolve()
            }
        })
    },
        K = {};
    s.parsePlugin = function (w) {
        if (s.preventParsing) return (new h).resolve();
        var D = r.plugins[w];
        if (!D) throw "reparsePlugin: plugin " + w + " is not defined!";
        if (!K[w]) {
            K[w] = new h;
            setTimeout(function () {
                var J = s.getPluginThemeVariables(w),
                    Q = "";
                for (prop in J) Q += "@" + prop + ":" + J[prop] + ";";
                J = new h;
                J.then(function (Z) {
                    K[this.name].resolve(Z);
                    K[this.name] = null
                }.bind(this), function () {
                    K[this.name].reject(data);
                    K[this.name] = null
                }.bind(this));
                e(J, w, Q)
            }.bind(D), 0)
        }
        return K[w]
    };
    var L = function (w, D, J, Q) {
        J = J.replace(/url\(['"]*([^'")]*)(['"]*)\)/g, "url(" + w + "$1)");
        q[D] += J;
        Q && Q.resolve()
    },
        n = null;
    s.registerThemeStyles =

    function (w) {
        var D = w.getPluginName(),
            J = r.getResourceURL(D);
        if (!(w.url instanceof Array)) w.url = [w.url];
        q[D] = "";
        var Q = [],
            Z = s.preventParsing;
        w.url.forEach(function (T) {
            if (B[D] && B[D][T]) L(J, D, B[D][T]);
            else {
                var ca = new h;
                Q.push(ca);
                var ha = J + T + "?" + (new Date).getTime();
                f.xhr("GET", ha, true, function (ga) {
                    ga.overrideMimeType("text/plain")
                }).then(function (ga) {
                    L(J, D, ga, ca)
                }, function () {
                    l.error("registerLessFile: Could not load " + J + T);
                    ca.resolve()
                })
            }
        });
        if (Q.length === 0) s.parsePlugin(D);
        else {
            Z || d(Q).then(function () {
                s.parsePlugin(D)
            });
            if (n !== null) Q = Q.concat(n);
            n = d(Q)
        }
    };
    s.reparse = function () {
        var w = new h;
        if (s.preventParsing) return w.resolve();
        n ? n.then(function () {
            var D = [],
                J = s.basePluginName;
            J !== null && q[J] && D.push(s.parsePlugin(J));
            for (var Q in q) Q !== J && D.push(s.parsePlugin(Q));
            d(D).then(w.resolve.bind(w), w.reject.bind(w))
        }, function (D) {
            w.reject(D)
        }) : w.resolve();
        return w
    };
    s.unregisterThemeStyles = function (w) {
        w = w.getPluginName();
        if (j[w]) {
            var D = document.getElementById("_bespin_theme_style_" + j[w]);
            D.parentNode.removeChild(D);
            delete j[w];
            delete q[w]
        }
    }
});
bespin.tiki.register("::types", {
    name: "types",
    dependencies: {}
});
bespin.tiki.module("types:basic", function (y, s) {
    var v = y("bespin:plugins").catalog,
        r = y("bespin:console").console,
        l = y("bespin:promise").Promise;
    s.text = {
        isValid: function (h) {
            return typeof h == "string"
        },
        toString: function (h) {
            return h
        },
        fromString: function (h) {
            return h
        }
    };
    s.number = {
        isValid: function (h) {
            if (isNaN(h)) return false;
            if (h === null) return false;
            if (h === undefined) return false;
            if (h === Infinity) return false;
            return typeof h == "number"
        },
        toString: function (h) {
            if (!h) return null;
            return "" + h
        },
        fromString: function (h) {
            if (!h) return null;
            var d = parseInt(h, 10);
            if (isNaN(d)) throw new Error("Can't convert \"" + h + '" to a number.');
            return d
        }
    };
    s.bool = {
        isValid: function (h) {
            return typeof h == "boolean"
        },
        toString: function (h) {
            return "" + h
        },
        fromString: function (h) {
            if (h === null) return null;
            if (!h.toLowerCase) return !!h;
            var d = h.toLowerCase();
            if (d == "true") return true;
            else if (d == "false") return false;
            return !!h
        }
    };
    s.object = {
        isValid: function (h) {
            return typeof h == "object"
        },
        toString: function (h) {
            return JSON.stringify(h)
        },
        fromString: function (h) {
            return JSON.parse(h)
        }
    };
    s.selection = {
        isValid: function (h, d) {
            if (typeof h != "string") return false;
            if (!d.data) {
                r.error("Missing data on selection type extension. Skipping");
                return true
            }
            var f = false;
            d.data.forEach(function (m) {
                if (h == m) f = true
            });
            return f
        },
        toString: function (h) {
            return h
        },
        fromString: function (h) {
            return h
        },
        resolveTypeSpec: function (h, d) {
            var f = new l;
            if (d.data) {
                h.data = d.data;
                f.resolve()
            } else if (d.pointer) v.loadObjectForPropertyPath(d.pointer).then(function (m) {
                m = m(d);
                if (typeof m.then === "function") m.then(function (i) {
                    h.data =
                    i;
                    f.resolve()
                });
                else {
                    h.data = m;
                    f.resolve()
                }
            }, function (m) {
                f.reject(m)
            });
            else {
                r.warn("Missing data/pointer for selection", d);
                f.resolve()
            }
            return f
        }
    }
});
bespin.tiki.module("types:types", function (y, s) {
    function v(d) {
        var f = new h,
            m = l.getExtensionByKey("type", d.name);
        m ? f.resolve({
            ext: m,
            typeSpec: d
        }) : f.reject(new Error("Unknown type: " + d.name));
        return f
    }
    function r(d) {
        if (typeof d === "string") return v({
            name: d
        });
        if (typeof d === "object") if (d.name === "deferred") {
            var f = new h;
            s.undeferTypeSpec(d).then(function (m) {
                r(m).then(function (i) {
                    f.resolve(i)
                }, function (i) {
                    f.reject(i)
                })
            });
            return f
        } else return v(d);
        throw new Error("Unknown typeSpec type: " + typeof d);
    }
    var l = y("bespin:plugins").catalog;
    y("bespin:console");
    var h = y("bespin:promise").Promise;
    s.getSimpleName = function (d) {
        if (!d) throw new Error("null|undefined is not a valid typeSpec");
        if (typeof d == "string") return d;
        if (typeof d == "object") {
            if (!d.name) throw new Error("Missing name member to typeSpec");
            return d.name
        }
        throw new Error("Not a typeSpec: " + d);
    };
    s.equals = function (d, f) {
        return s.getSimpleName(d) == s.getSimpleName(f)
    };
    s.undeferTypeSpec = function (d) {
        var f = new h;
        if (!d.pointer) {
            f.reject(new Error("Missing deferred pointer"));
            return f
        }
        l.loadObjectForPropertyPath(d.pointer).then(function (m) {
            m =
            m(d);
            typeof m.then === "function" ? m.then(function (i) {
                f.resolve(i)
            }, function (i) {
                f.reject(i)
            }) : f.resolve(m)
        }, function (m) {
            f.reject(m)
        });
        return f
    };
    s.resolveType = function (d) {
        var f = new h;
        r(d).then(function (m) {
            m.ext.load(function (i) {
                typeof i.resolveTypeSpec === "function" ? i.resolveTypeSpec(m.ext, m.typeSpec).then(function () {
                    f.resolve({
                        type: i,
                        ext: m.ext
                    })
                }, function (g) {
                    f.reject(g)
                }) : f.resolve({
                    type: i,
                    ext: m.ext
                })
            })
        }, function (m) {
            f.reject(m)
        });
        return f
    };
    s.fromString = function (d, f) {
        var m = new h;
        s.resolveType(f).then(function (i) {
            m.resolve(i.type.fromString(d, i.ext))
        });
        return m
    };
    s.toString = function (d, f) {
        var m = new h;
        s.resolveType(f).then(function (i) {
            m.resolve(i.type.toString(d, i.ext))
        });
        return m
    };
    s.isValid = function (d, f) {
        var m = new h;
        s.resolveType(f).then(function (i) {
            m.resolve(i.type.isValid(d, i.ext))
        });
        return m
    }
});
bespin.tiki.module("types:index", function () {});
bespin.tiki.register("::jquery", {
    name: "jquery",
    dependencies: {}
});
bespin.tiki.module("jquery:index", function (y, s) {
    function v() {
        if (!e.isReady) {
            try {
                n.documentElement.doScroll("left")
            } catch (a) {
                setTimeout(v, 1);
                return
            }
            e.ready()
        }
    }
    function r(a, b) {
        b.src ? e.ajax({
            url: b.src,
            async: false,
            dataType: "script"
        }) : e.globalEval(b.text || b.textContent || b.innerHTML || "");b.parentNode && b.parentNode.removeChild(b)
    }
    function l(a, b, k, p, o, z) {
        var A = a.length;
        if (typeof b === "object") {
            for (var I in b) l(a, I, b[I], p, o, k);
            return a
        }
        if (k !== undefined) {
            p = !z && p && e.isFunction(k);
            for (I = 0; I < A; I++) o(a[I], b, p ? k.call(a[I], I, o(a[I], b)) : k,
            z);
            return a
        }
        return A ? o(a[0], b) : undefined
    }
    function h() {
        return (new Date).getTime()
    }
    function d() {
        return false
    }
    function f() {
        return true
    }
    function m(a, b, k) {
        k[0].type = a;
        return e.event.handle.apply(b, k)
    }
    function i(a) {
        var b, k = [],
            p = [],
            o = arguments,
            z, A, I, E, H, R;
        A = e.data(this, "events");
        if (!(a.liveFired === this || !A || !A.live || a.button && a.type === "click")) {
            a.liveFired = this;
            var W = A.live.slice(0);
            for (E = 0; E < W.length; E++) {
                A = W[E];
                A.origType.replace(sa, "") === a.type ? p.push(A.selector) : W.splice(E--, 1)
            }
            z = e(a.target).closest(p, a.currentTarget);
            H = 0;
            for (R = z.length; H < R; H++) for (E = 0; E < W.length; E++) {
                A = W[E];
                if (z[H].selector === A.selector) {
                    I = z[H].elem;
                    p = null;
                    if (A.preType === "mouseenter" || A.preType === "mouseleave") p = e(a.relatedTarget).closest(A.selector)[0];
                    if (!p || p !== I) k.push({
                        elem: I,
                        handleObj: A
                    })
                }
            }
            H = 0;
            for (R = k.length; H < R; H++) {
                z = k[H];
                a.currentTarget = z.elem;
                a.data = z.handleObj.data;
                a.handleObj = z.handleObj;
                if (z.handleObj.origHandler.apply(z.elem, o) === false) {
                    b = false;
                    break
                }
            }
            return b
        }
    }
    function g(a, b) {
        return "live." + (a && a !== "*" ? a + "." : "") + b.replace(/\./g, "`").replace(/ /g, "&")
    }
    function j(a) {
        return !a || !a.parentNode || a.parentNode.nodeType === 11
    }
    function q(a, b) {
        var k = 0;
        b.each(function () {
            if (this.nodeName === (a[k] && a[k].nodeName)) {
                var p = e.data(a[k++]),
                    o = e.data(this, p);
                if (p = p && p.events) {
                    delete o.handle;
                    o.events = {};
                    for (var z in p) for (var A in p[z]) e.event.add(this, z, p[z][A], p[z][A].data)
                }
            }
        })
    }
    function t(a, b, k) {
        var p, o, z;
        b = b && b[0] ? b[0].ownerDocument || b[0] : n;
        if (a.length === 1 && typeof a[0] === "string" && a[0].length < 512 && b === n && !Ha.test(a[0]) && (e.support.checkClone || !Ia.test(a[0]))) {
            o = true;
            if (z = e.fragments[a[0]]) if (z !== 1) p = z
        }
        if (!p) {
            p = b.createDocumentFragment();
            e.clean(a, b, p, k)
        }
        if (o) e.fragments[a[0]] = z ? p : 1;
        return {
            fragment: p,
            cacheable: o
        }
    }
    function B(a, b) {
        var k = {};
        e.each(Ja.concat.apply([], Ja.slice(0, b)), function () {
            k[this] = a
        });
        return k
    }
    function C(a) {
        return "scrollTo" in a && a.document ? a : a.nodeType === 9 ? a.defaultView || a.parentWindow : false
    }
    var e = function (a, b) {
        return new e.fn.init(a, b)
    },
        K = window.jQuery,
        L = window.$,
        n = window.document,
        w, D = /^[^<]*(<[\w\W]+>)[^>]*$|^#([\w-]+)$/,
        J = /^.[^:#\[\.,]*$/,
        Q = /\S/,
        Z = /^(\s|\u00A0)+|(\s|\u00A0)+$/g,
        T = /^<(\w+)\s*\/?>(?:<\/\1>)?$/;
    y = navigator.userAgent;
    var ca = false,
        ha = [],
        ga, la = Object.prototype.toString,
        ma = Object.prototype.hasOwnProperty,
        na = Array.prototype.push,
        O = Array.prototype.slice,
        P = Array.prototype.indexOf;
    e.fn = e.prototype = {
        init: function (a, b) {
            var k, p;
            if (!a) return this;
            if (a.nodeType) {
                this.context = this[0] = a;
                this.length = 1;
                return this
            }
            if (a === "body" && !b) {
                this.context = n;
                this[0] = n.body;
                this.selector = "body";
                this.length = 1;
                return this
            }
            if (typeof a === "string") if ((k = D.exec(a)) && (k[1] || !b)) if (k[1]) {
                p = b ? b.ownerDocument || b : n;
                if (a = T.exec(a)) if (e.isPlainObject(b)) {
                    a = [n.createElement(a[1])];
                    e.fn.attr.call(a, b, true)
                } else a = [p.createElement(a[1])];
                else {
                    a = t([k[1]], [p]);
                    a = (a.cacheable ? a.fragment.cloneNode(true) : a.fragment).childNodes
                }
                return e.merge(this, a)
            } else {
                if (b = n.getElementById(k[2])) {
                    if (b.id !== k[2]) return w.find(a);
                    this.length = 1;
                    this[0] = b
                }
                this.context = n;
                this.selector = a;
                return this
            } else if (!b && /^\w+$/.test(a)) {
                this.selector = a;
                this.context = n;
                a = n.getElementsByTagName(a);
                return e.merge(this, a)
            } else return !b || b.jquery ? (b || w).find(a) : e(b).find(a);
            else if (e.isFunction(a)) return w.ready(a);
            if (a.selector !== undefined) {
                this.selector = a.selector;
                this.context = a.context
            }
            return e.makeArray(a, this)
        },
        selector: "",
        jquery: "1.4.2",
        length: 0,
        size: function () {
            return this.length
        },
        toArray: function () {
            return O.call(this, 0)
        },
        get: function (a) {
            return a == null ? this.toArray() : a < 0 ? this.slice(a)[0] : this[a]
        },
        pushStack: function (a, b, k) {
            var p = e();
            e.isArray(a) ? na.apply(p, a) : e.merge(p, a);p.prevObject = this;
            p.context = this.context;
            if (b === "find") p.selector = this.selector + (this.selector ? " " : "") + k;
            else if (b) p.selector = this.selector + "." + b + "(" + k + ")";
            return p
        },
        each: function (a, b) {
            return e.each(this, a, b)
        },
        ready: function (a) {
            e.bindReady();
            if (e.isReady) a.call(n, e);
            else ha && ha.push(a);
            return this
        },
        eq: function (a) {
            return a === -1 ? this.slice(a) : this.slice(a, +a + 1)
        },
        first: function () {
            return this.eq(0)
        },
        last: function () {
            return this.eq(-1)
        },
        slice: function () {
            return this.pushStack(O.apply(this, arguments), "slice", O.call(arguments).join(","))
        },
        map: function (a) {
            return this.pushStack(e.map(this, function (b, k) {
                return a.call(b, k, b)
            }))
        },
        end: function () {
            return this.prevObject || e(null)
        },
        push: na,
        sort: [].sort,
        splice: [].splice
    };
    e.fn.init.prototype = e.fn;
    e.extend = e.fn.extend = function () {
        var a = arguments[0] || {},
            b = 1,
            k = arguments.length,
            p = false,
            o, z, A, I;
        if (typeof a === "boolean") {
            p = a;
            a = arguments[1] || {};
            b = 2
        }
        if (typeof a !== "object" && !e.isFunction(a)) a = {};
        if (k === b) {
            a = this;
            --b
        }
        for (; b < k; b++) if ((o = arguments[b]) != null) for (z in o) {
            A = a[z];
            I = o[z];
            if (a !== I) if (p && I && (e.isPlainObject(I) || e.isArray(I))) {
                A = A && (e.isPlainObject(A) || e.isArray(A)) ? A : e.isArray(I) ? [] : {};a[z] = e.extend(p, A, I)
            } else if (I !== undefined) a[z] = I
        }
        return a
    };
    e.extend({
        noConflict: function (a) {
            window.$ = L;
            if (a) window.jQuery = K;
            return e
        },
        isReady: false,
        ready: function () {
            if (!e.isReady) {
                if (!n.body) return setTimeout(e.ready, 13);
                e.isReady = true;
                if (ha) {
                    for (var a, b = 0; a = ha[b++];) a.call(n, e);
                    ha = null
                }
                e.fn.triggerHandler && e(n).triggerHandler("ready")
            }
        },
        bindReady: function () {
            if (!ca) {
                ca = true;
                if (n.readyState === "complete") return e.ready();
                if (n.addEventListener) {
                    n.addEventListener("DOMContentLoaded", ga, false);
                    window.addEventListener("load", e.ready, false)
                } else if (n.attachEvent) {
                    n.attachEvent("onreadystatechange", ga);
                    window.attachEvent("onload", e.ready);
                    var a = false;
                    try {
                        a = window.frameElement == null
                    } catch (b) {}
                    n.documentElement.doScroll && a && v()
                }
            }
        },
        isFunction: function (a) {
            return la.call(a) === "[object Function]"
        },
        isArray: function (a) {
            return la.call(a) === "[object Array]"
        },
        isPlainObject: function (a) {
            if (!a || la.call(a) !== "[object Object]" || a.nodeType || a.setInterval) return false;
            if (a.constructor && !ma.call(a, "constructor") && !ma.call(a.constructor.prototype, "isPrototypeOf")) return false;
            var b;
            for (b in a);
            return b === undefined || ma.call(a, b)
        },
        isEmptyObject: function (a) {
            for (var b in a) return false;
            return true
        },
        error: function (a) {
            throw a;
        },
        parseJSON: function (a) {
            if (typeof a !== "string" || !a) return null;
            a = e.trim(a);
            if (/^[\],:{}\s]*$/.test(a.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, "@").replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, "]").replace(/(?:^|:|,)(?:\s*\[)+/g, ""))) return window.JSON && window.JSON.parse ? window.JSON.parse(a) : (new Function("return " + a))();
            else e.error("Invalid JSON: " + a)
        },
        noop: function () {},
        globalEval: function (a) {
            if (a && Q.test(a)) {
                var b = n.getElementsByTagName("head")[0] || n.documentElement,
                    k = n.createElement("script");
                k.type = "text/javascript";
                if (e.support.scriptEval) k.appendChild(n.createTextNode(a));
                else k.text = a;
                b.insertBefore(k, b.firstChild);
                b.removeChild(k)
            }
        },
        nodeName: function (a, b) {
            return a.nodeName && a.nodeName.toUpperCase() === b.toUpperCase()
        },
        each: function (a, b, k) {
            var p, o = 0,
                z = a.length,
                A = z === undefined || e.isFunction(a);
            if (k) if (A) for (p in a) {
                if (b.apply(a[p], k) === false) break
            } else for (; o < z;) {
                if (b.apply(a[o++], k) === false) break
            } else if (A) for (p in a) {
                if (b.call(a[p], p, a[p]) === false) break
            } else for (k = a[0]; o < z && b.call(k, o, k) !== false; k = a[++o]);
            return a
        },
        trim: function (a) {
            return (a || "").replace(Z, "")
        },
        makeArray: function (a, b) {
            b = b || [];
            if (a != null) a.length == null || typeof a === "string" || e.isFunction(a) || typeof a !== "function" && a.setInterval ? na.call(b, a) : e.merge(b, a);
            return b
        },
        inArray: function (a, b) {
            if (b.indexOf) return b.indexOf(a);
            for (var k = 0, p = b.length; k < p; k++) if (b[k] === a) return k;
            return -1
        },
        merge: function (a, b) {
            var k = a.length,
                p = 0;
            if (typeof b.length === "number") for (var o = b.length; p < o; p++) a[k++] = b[p];
            else for (; b[p] !== undefined;) a[k++] = b[p++];
            a.length = k;
            return a
        },
        grep: function (a, b, k) {
            for (var p = [], o = 0, z = a.length; o < z; o++)!k !== !b(a[o], o) && p.push(a[o]);
            return p
        },
        map: function (a, b, k) {
            for (var p = [], o, z = 0, A = a.length; z < A; z++) {
                o = b(a[z], z, k);
                if (o != null) p[p.length] = o
            }
            return p.concat.apply([], p)
        },
        guid: 1,
        proxy: function (a, b, k) {
            if (arguments.length === 2) if (typeof b === "string") {
                k = a;
                a = k[b];
                b = undefined
            } else if (b && !e.isFunction(b)) {
                k = b;
                b = undefined
            }
            if (!b && a) b = function () {
                return a.apply(k || this, arguments)
            };
            if (a) b.guid = a.guid = a.guid || b.guid || e.guid++;
            return b
        },
        uaMatch: function (a) {
            a = a.toLowerCase();
            a = /(webkit)[ \/]([\w.]+)/.exec(a) || /(opera)(?:.*version)?[ \/]([\w.]+)/.exec(a) || /(msie) ([\w.]+)/.exec(a) || !/compatible/.test(a) && /(mozilla)(?:.*? rv:([\w.]+))?/.exec(a) || [];
            return {
                browser: a[1] || "",
                version: a[2] || "0"
            }
        },
        browser: {}
    });
    y = e.uaMatch(y);
    if (y.browser) {
        e.browser[y.browser] = true;
        e.browser.version = y.version
    }
    if (e.browser.webkit) e.browser.safari = true;
    if (P) e.inArray = function (a, b) {
        return P.call(b, a)
    };
    w = e(n);
    if (n.addEventListener) ga = function () {
        n.removeEventListener("DOMContentLoaded", ga, false);
        e.ready()
    };
    else if (n.attachEvent) ga = function () {
        if (n.readyState === "complete") {
            n.detachEvent("onreadystatechange", ga);
            e.ready()
        }
    };
    (function () {
        e.support = {};
        var a = n.documentElement,
            b = n.createElement("script"),
            k = n.createElement("div"),
            p = "script" + h();
        k.style.display = "none";
        k.innerHTML = "   <link/><table></table><a href='/a' style='color:red;float:left;opacity:.55;'>a</a><input type='checkbox'/>";
        var o = k.getElementsByTagName("*"),
            z = k.getElementsByTagName("a")[0];
        if (!(!o || !o.length || !z)) {
            e.support = {
                leadingWhitespace: k.firstChild.nodeType === 3,
                tbody: !k.getElementsByTagName("tbody").length,
                htmlSerialize: !! k.getElementsByTagName("link").length,
                style: /red/.test(z.getAttribute("style")),
                hrefNormalized: z.getAttribute("href") === "/a",
                opacity: /^0.55$/.test(z.style.opacity),
                cssFloat: !! z.style.cssFloat,
                checkOn: k.getElementsByTagName("input")[0].value === "on",
                optSelected: n.createElement("select").appendChild(n.createElement("option")).selected,
                parentNode: k.removeChild(k.appendChild(n.createElement("div"))).parentNode === null,
                deleteExpando: true,
                checkClone: false,
                scriptEval: false,
                noCloneEvent: true,
                boxModel: null
            };
            b.type = "text/javascript";
            try {
                b.appendChild(n.createTextNode("window." + p + "=1;"))
            } catch (A) {}
            a.insertBefore(b, a.firstChild);
            if (window[p]) {
                e.support.scriptEval = true;
                delete window[p]
            }
            try {
                delete b.test
            } catch (I) {
                e.support.deleteExpando =
                false
            }
            a.removeChild(b);
            if (k.attachEvent && k.fireEvent) {
                k.attachEvent("onclick", function E() {
                    e.support.noCloneEvent = false;
                    k.detachEvent("onclick", E)
                });
                k.cloneNode(true).fireEvent("onclick")
            }
            k = n.createElement("div");
            k.innerHTML = "<input type='radio' name='radiotest' checked='checked'/>";
            a = n.createDocumentFragment();
            a.appendChild(k.firstChild);
            e.support.checkClone = a.cloneNode(true).cloneNode(true).lastChild.checked;
            e(function () {
                var E = n.createElement("div");
                E.style.width = E.style.paddingLeft = "1px";
                n.body.appendChild(E);
                e.boxModel = e.support.boxModel = E.offsetWidth === 2;
                n.body.removeChild(E).style.display = "none"
            });
            a = function (E) {
                var H = n.createElement("div");
                E = "on" + E;
                var R = E in H;
                if (!R) {
                    H.setAttribute(E, "return;");
                    R = typeof H[E] === "function"
                }
                return R
            };
            e.support.submitBubbles = a("submit");
            e.support.changeBubbles = a("change");
            a = b = k = o = z = null
        }
    })();
    e.props = {
        "for": "htmlFor",
        "class": "className",
        readonly: "readOnly",
        maxlength: "maxLength",
        cellspacing: "cellSpacing",
        rowspan: "rowSpan",
        colspan: "colSpan",
        tabindex: "tabIndex",
        usemap: "useMap",
        frameborder: "frameBorder"
    };
    var S = "jQuery" + h(),
        U = 0,
        aa = {};
    e.extend({
        cache: {},
        expando: S,
        noData: {
            embed: true,
            object: true,
            applet: true
        },
        data: function (a, b, k) {
            if (!(a.nodeName && e.noData[a.nodeName.toLowerCase()])) {
                a = a == window ? aa : a;
                var p = a[S],
                    o = e.cache;
                if (!p && typeof b === "string" && k === undefined) return null;p || (p = ++U);
                if (typeof b === "object") {
                    a[S] = p;
                    o[p] = e.extend(true, {}, b)
                } else if (!o[p]) {
                    a[S] = p;
                    o[p] = {}
                }
                a = o[p];
                if (k !== undefined) a[b] = k;
                return typeof b === "string" ? a[b] : a
            }
        },
        removeData: function (a, b) {
            if (!(a.nodeName && e.noData[a.nodeName.toLowerCase()])) {
                a = a == window ? aa : a;
                var k = a[S],
                    p = e.cache,
                    o = p[k];
                if (b) {
                    if (o) {
                        delete o[b];
                        e.isEmptyObject(o) && e.removeData(a)
                    }
                } else {
                    if (e.support.deleteExpando) delete a[e.expando];
                    else a.removeAttribute && a.removeAttribute(e.expando);
                    delete p[k]
                }
            }
        }
    });
    e.fn.extend({
        data: function (a, b) {
            if (typeof a === "undefined" && this.length) return e.data(this[0]);
            else if (typeof a === "object") return this.each(function () {
                e.data(this, a)
            });
            var k = a.split(".");
            k[1] = k[1] ? "." + k[1] : "";
            if (b === undefined) {
                var p = this.triggerHandler("getData" + k[1] + "!", [k[0]]);
                if (p === undefined && this.length) p = e.data(this[0], a);
                return p === undefined && k[1] ? this.data(k[0]) : p
            } else return this.trigger("setData" + k[1] + "!", [k[0], b]).each(function () {
                e.data(this, a, b)
            })
        },
        removeData: function (a) {
            return this.each(function () {
                e.removeData(this, a)
            })
        }
    });
    e.extend({
        queue: function (a, b, k) {
            if (a) {
                b = (b || "fx") + "queue";
                var p = e.data(a, b);
                if (!k) return p || [];
                if (!p || e.isArray(k)) p = e.data(a, b, e.makeArray(k));
                else p.push(k);
                return p
            }
        },
        dequeue: function (a, b) {
            b = b || "fx";
            var k = e.queue(a, b),
                p =
                k.shift();
            if (p === "inprogress") p = k.shift();
            if (p) {
                b === "fx" && k.unshift("inprogress");
                p.call(a, function () {
                    e.dequeue(a, b)
                })
            }
        }
    });
    e.fn.extend({
        queue: function (a, b) {
            if (typeof a !== "string") {
                b = a;
                a = "fx"
            }
            if (b === undefined) return e.queue(this[0], a);
            return this.each(function () {
                var k = e.queue(this, a, b);
                a === "fx" && k[0] !== "inprogress" && e.dequeue(this, a)
            })
        },
        dequeue: function (a) {
            return this.each(function () {
                e.dequeue(this, a)
            })
        },
        delay: function (a, b) {
            a = e.fx ? e.fx.speeds[a] || a : a;b = b || "fx";
            return this.queue(b, function () {
                var k =
                this;
                setTimeout(function () {
                    e.dequeue(k, b)
                }, a)
            })
        },
        clearQueue: function (a) {
            return this.queue(a || "fx", [])
        }
    });
    var fa = /[\n\t]/g,
        xa = /\s+/,
        Za = /\r/g,
        $a = /href|src|style/,
        ab = /(button|input)/i,
        bb = /(button|input|object|select|textarea)/i,
        cb = /^(a|area)$/i,
        Ka = /radio|checkbox/;
    e.fn.extend({
        attr: function (a, b) {
            return l(this, a, b, true, e.attr)
        },
        removeAttr: function (a) {
            return this.each(function () {
                e.attr(this, a, "");
                this.nodeType === 1 && this.removeAttribute(a)
            })
        },
        addClass: function (a) {
            if (e.isFunction(a)) return this.each(function (H) {
                var R =
                e(this);
                R.addClass(a.call(this, H, R.attr("class")))
            });
            if (a && typeof a === "string") for (var b = (a || "").split(xa), k = 0, p = this.length; k < p; k++) {
                var o = this[k];
                if (o.nodeType === 1) if (o.className) {
                    for (var z = " " + o.className + " ", A = o.className, I = 0, E = b.length; I < E; I++) if (z.indexOf(" " + b[I] + " ") < 0) A += " " + b[I];
                    o.className = e.trim(A)
                } else o.className = a
            }
            return this
        },
        removeClass: function (a) {
            if (e.isFunction(a)) return this.each(function (E) {
                var H = e(this);
                H.removeClass(a.call(this, E, H.attr("class")))
            });
            if (a && typeof a === "string" || a === undefined) for (var b = (a || "").split(xa), k = 0, p = this.length; k < p; k++) {
                var o = this[k];
                if (o.nodeType === 1 && o.className) if (a) {
                    for (var z = (" " + o.className + " ").replace(fa, " "), A = 0, I = b.length; A < I; A++) z = z.replace(" " + b[A] + " ", " ");
                    o.className = e.trim(z)
                } else o.className = ""
            }
            return this
        },
        toggleClass: function (a, b) {
            var k = typeof a,
                p = typeof b === "boolean";
            if (e.isFunction(a)) return this.each(function (o) {
                var z = e(this);
                z.toggleClass(a.call(this, o, z.attr("class"), b), b)
            });
            return this.each(function () {
                if (k === "string") for (var o, z = 0, A = e(this), I = b, E = a.split(xa); o = E[z++];) {
                    I = p ? I : !A.hasClass(o);A[I ? "addClass" : "removeClass"](o)
                } else if (k === "undefined" || k === "boolean") {
                    this.className && e.data(this, "__className__", this.className);
                    this.className = this.className || a === false ? "" : e.data(this, "__className__") || ""
                }
            })
        },
        hasClass: function (a) {
            a = " " + a + " ";
            for (var b = 0, k = this.length; b < k; b++) if ((" " + this[b].className + " ").replace(fa, " ").indexOf(a) > -1) return true;
            return false
        },
        val: function (a) {
            if (a === undefined) {
                var b = this[0];
                if (b) {
                    if (e.nodeName(b, "option")) return (b.attributes.value || {}).specified ? b.value : b.text;
                    if (e.nodeName(b, "select")) {
                        var k = b.selectedIndex,
                            p = [],
                            o = b.options;
                        b = b.type === "select-one";
                        if (k < 0) return null;
                        var z = b ? k : 0;
                        for (k = b ? k + 1 : o.length;z < k;z++) {
                            var A = o[z];
                            if (A.selected) {
                                a = e(A).val();
                                if (b) return a;
                                p.push(a)
                            }
                        }
                        return p
                    }
                    if (Ka.test(b.type) && !e.support.checkOn) return b.getAttribute("value") === null ? "on" : b.value;
                    return (b.value || "").replace(Za, "")
                }
            } else {
                var I = e.isFunction(a);
                return this.each(function (E) {
                    var H = e(this),
                        R = a;
                    if (this.nodeType === 1) {
                        if (I) R = a.call(this, E, H.val());
                        if (typeof R === "number") R += "";
                        if (e.isArray(R) && Ka.test(this.type)) this.checked = e.inArray(H.val(), R) >= 0;
                        else if (e.nodeName(this, "select")) {
                            var W = e.makeArray(R);
                            e("option", this).each(function () {
                                this.selected = e.inArray(e(this).val(), W) >= 0
                            });
                            if (!W.length) this.selectedIndex = -1
                        } else this.value = R
                    }
                })
            }
        }
    });
    e.extend({
        attrFn: {
            val: true,
            css: true,
            html: true,
            text: true,
            data: true,
            width: true,
            height: true,
            offset: true
        },
        attr: function (a, b, k, p) {
            if (!(!a || a.nodeType === 3 || a.nodeType === 8)) {
                if (p && b in e.attrFn) return e(a)[b](k);
                p = a.nodeType !== 1 || !e.isXMLDoc(a);
                var o = k !== undefined;
                b = p && e.props[b] || b;
                if (a.nodeType === 1) {
                    var z = $a.test(b);
                    if (b in a && p && !z) {
                        if (o) {
                            b === "type" && ab.test(a.nodeName) && a.parentNode && e.error("type property can't be changed");
                            a[b] = k
                        }
                        if (e.nodeName(a, "form") && a.getAttributeNode(b)) return a.getAttributeNode(b).nodeValue;
                        if (b === "tabIndex") return (b = a.getAttributeNode("tabIndex")) && b.specified ? b.value : bb.test(a.nodeName) || cb.test(a.nodeName) && a.href ? 0 : undefined;
                        return a[b]
                    }
                    if (!e.support.style && p && b === "style") {
                        if (o) a.style.cssText = "" + k;
                        return a.style.cssText
                    }
                    o && a.setAttribute(b, "" + k);
                    a = !e.support.hrefNormalized && p && z ? a.getAttribute(b, 2) : a.getAttribute(b);
                    return a === null ? undefined : a
                }
                return e.style(a, b, k)
            }
        }
    });
    var sa = /\.(.*)$/,
        db = function (a) {
            return a.replace(/[^\w\s\.\|`]/g, function (b) {
                return "\\" + b
            })
        };
    e.event = {
        add: function (a, b, k, p) {
            if (!(a.nodeType === 3 || a.nodeType === 8)) {
                if (a.setInterval && a !== window && !a.frameElement) a = window;
                var o, z;
                if (k.handler) {
                    o = k;
                    k = o.handler
                }
                if (!k.guid) k.guid = e.guid++;
                if (z =
                e.data(a)) {
                    var A = z.events = z.events || {},
                        I = z.handle;
                    if (!I) z.handle = I = function () {
                        return typeof e !== "undefined" && !e.event.triggered ? e.event.handle.apply(I.elem, arguments) : undefined
                    };
                    I.elem = a;
                    b = b.split(" ");
                    for (var E, H = 0, R; E = b[H++];) {
                        z = o ? e.extend({}, o) : {
                            handler: k,
                            data: p
                        };
                        if (E.indexOf(".") > -1) {
                            R = E.split(".");
                            E = R.shift();
                            z.namespace = R.slice(0).sort().join(".")
                        } else {
                            R = [];
                            z.namespace = ""
                        }
                        z.type = E;z.guid = k.guid;
                        var W = A[E],
                            ba = e.event.special[E] || {};
                        if (!W) {
                            W = A[E] = [];
                            if (!ba.setup || ba.setup.call(a, p, R, I) === false) if (a.addEventListener) a.addEventListener(E, I, false);
                            else a.attachEvent && a.attachEvent("on" + E, I)
                        }
                        if (ba.add) {
                            ba.add.call(a, z);
                            if (!z.handler.guid) z.handler.guid = k.guid
                        }
                        W.push(z);e.event.global[E] = true
                    }
                    a = null
                }
            }
        },
        global: {},
        remove: function (a, b, k, p) {
            if (!(a.nodeType === 3 || a.nodeType === 8)) {
                var o, z = 0,
                    A, I, E, H, R, W, ba = e.data(a),
                    ea = ba && ba.events;
                if (ba && ea) {
                    if (b && b.type) {
                        k = b.handler;
                        b = b.type
                    }
                    if (!b || typeof b === "string" && b.charAt(0) === ".") {
                        b = b || "";
                        for (o in ea) e.event.remove(a, o + b)
                    } else {
                        for (b = b.split(" "); o = b[z++];) {
                            H = o;
                            A = o.indexOf(".") < 0;
                            I = [];
                            if (!A) {
                                I = o.split(".");
                                o = I.shift();
                                E = new RegExp("(^|\\.)" + e.map(I.slice(0).sort(), db).join("\\.(?:.*\\.)?") + "(\\.|$)")
                            }
                            if (R = ea[o]) if (k) {
                                H = e.event.special[o] || {};
                                for (da = p || 0; da < R.length; da++) {
                                    W = R[da];
                                    if (k.guid === W.guid) {
                                        if (A || E.test(W.namespace)) {
                                            p == null && R.splice(da--, 1);
                                            H.remove && H.remove.call(a, W)
                                        }
                                        if (p != null) break
                                    }
                                }
                                if (R.length === 0 || p != null && R.length === 1) {
                                    if (!H.teardown || H.teardown.call(a, I) === false) La(a, o, ba.handle);
                                    delete ea[o]
                                }
                            } else for (var da = 0; da < R.length; da++) {
                                W = R[da];
                                if (A || E.test(W.namespace)) {
                                    e.event.remove(a, H, W.handler, da);
                                    R.splice(da--, 1)
                                }
                            }
                        }
                        if (e.isEmptyObject(ea)) {
                            if (b = ba.handle) b.elem = null;
                            delete ba.events;
                            delete ba.handle;
                            e.isEmptyObject(ba) && e.removeData(a)
                        }
                    }
                }
            }
        },
        trigger: function (a, b, k, p) {
            var o = a.type || a;
            if (!p) {
                a = typeof a === "object" ? a[S] ? a : e.extend(e.Event(o), a) : e.Event(o);
                if (o.indexOf("!") >= 0) {
                    a.type = o = o.slice(0, -1);
                    a.exclusive = true
                }
                if (!k) {
                    a.stopPropagation();
                    e.event.global[o] && e.each(e.cache, function () {
                        this.events && this.events[o] && e.event.trigger(a, b, this.handle.elem)
                    })
                }
                if (!k || k.nodeType === 3 || k.nodeType === 8) return;a.result = undefined;a.target = k;b = e.makeArray(b);b.unshift(a)
            }
            a.currentTarget = k;
            (p = e.data(k, "handle")) && p.apply(k, b);
            p = k.parentNode || k.ownerDocument;
            try {
                if (!(k && k.nodeName && e.noData[k.nodeName.toLowerCase()])) if (k["on" + o] && k["on" + o].apply(k, b) === false) a.result = false
            } catch (z) {}
            if (!a.isPropagationStopped() && p) e.event.trigger(a, b, p, true);
            else if (!a.isDefaultPrevented()) {
                p = a.target;
                var A, I = e.nodeName(p, "a") && o === "click",
                    E = e.event.special[o] || {};
                if ((!E._default || E._default.call(k, a) === false) && !I && !(p && p.nodeName && e.noData[p.nodeName.toLowerCase()])) {
                    try {
                        if (p[o]) {
                            if (A = p["on" + o]) p["on" + o] = null;
                            e.event.triggered = true;
                            p[o]()
                        }
                    } catch (H) {}
                    if (A) p["on" + o] = A;
                    e.event.triggered = false
                }
            }
        },
        handle: function (a) {
            var b, k, p, o;
            a = arguments[0] = e.event.fix(a || window.event);
            a.currentTarget = this;
            b = a.type.indexOf(".") < 0 && !a.exclusive;
            if (!b) {
                k = a.type.split(".");
                a.type = k.shift();
                p = new RegExp("(^|\\.)" + k.slice(0).sort().join("\\.(?:.*\\.)?") + "(\\.|$)")
            }
            o = e.data(this, "events");
            k = o[a.type];
            if (o && k) {
                k = k.slice(0);
                o = 0;
                for (var z =
                k.length; o < z; o++) {
                    var A = k[o];
                    if (b || p.test(A.namespace)) {
                        a.handler = A.handler;
                        a.data = A.data;
                        a.handleObj = A;
                        A = A.handler.apply(this, arguments);
                        if (A !== undefined) {
                            a.result = A;
                            if (A === false) {
                                a.preventDefault();
                                a.stopPropagation()
                            }
                        }
                        if (a.isImmediatePropagationStopped()) break
                    }
                }
            }
            return a.result
        },
        props: "altKey attrChange attrName bubbles button cancelable charCode clientX clientY ctrlKey currentTarget data detail eventPhase fromElement handler keyCode layerX layerY metaKey newValue offsetX offsetY originalTarget pageX pageY prevValue relatedNode relatedTarget screenX screenY shiftKey srcElement target toElement view wheelDelta which".split(" "),
        fix: function (a) {
            if (a[S]) return a;
            var b = a;
            a = e.Event(b);
            for (var k = this.props.length, p; k;) {
                p = this.props[--k];
                a[p] = b[p]
            }
            if (!a.target) a.target = a.srcElement || n;
            if (a.target.nodeType === 3) a.target = a.target.parentNode;
            if (!a.relatedTarget && a.fromElement) a.relatedTarget = a.fromElement === a.target ? a.toElement : a.fromElement;
            if (a.pageX == null && a.clientX != null) {
                b = n.documentElement;
                k = n.body;
                a.pageX = a.clientX + (b && b.scrollLeft || k && k.scrollLeft || 0) - (b && b.clientLeft || k && k.clientLeft || 0);
                a.pageY = a.clientY + (b && b.scrollTop || k && k.scrollTop || 0) - (b && b.clientTop || k && k.clientTop || 0)
            }
            if (!a.which && (a.charCode || a.charCode === 0 ? a.charCode : a.keyCode)) a.which = a.charCode || a.keyCode;
            if (!a.metaKey && a.ctrlKey) a.metaKey = a.ctrlKey;
            if (!a.which && a.button !== undefined) a.which = a.button & 1 ? 1 : a.button & 2 ? 3 : a.button & 4 ? 2 : 0;
            return a
        },
        guid: 1E8,
        proxy: e.proxy,
        special: {
            ready: {
                setup: e.bindReady,
                teardown: e.noop
            },
            live: {
                add: function (a) {
                    e.event.add(this, a.origType, e.extend({}, a, {
                        handler: i
                    }))
                },
                remove: function (a) {
                    var b = true,
                        k = a.origType.replace(sa, "");
                    e.each(e.data(this, "events").live || [], function () {
                        if (k === this.origType.replace(sa, "")) return b = false
                    });
                    b && e.event.remove(this, a.origType, i)
                }
            },
            beforeunload: {
                setup: function (a, b, k) {
                    if (this.setInterval) this.onbeforeunload = k;
                    return false
                },
                teardown: function (a, b) {
                    if (this.onbeforeunload === b) this.onbeforeunload = null
                }
            }
        }
    };
    var La = n.removeEventListener ?
    function (a, b, k) {
        a.removeEventListener(b, k, false)
    } : function (a, b, k) {
        a.detachEvent("on" + b, k)
    };e.Event = function (a) {
        if (!this.preventDefault) return new e.Event(a);
        if (a && a.type) {
            this.originalEvent =
            a;
            this.type = a.type
        } else this.type = a;
        this.timeStamp = h();
        this[S] = true
    };e.Event.prototype = {
        preventDefault: function () {
            this.isDefaultPrevented = f;
            var a = this.originalEvent;
            if (a) {
                a.preventDefault && a.preventDefault();
                a.returnValue = false
            }
        },
        stopPropagation: function () {
            this.isPropagationStopped = f;
            var a = this.originalEvent;
            if (a) {
                a.stopPropagation && a.stopPropagation();
                a.cancelBubble = true
            }
        },
        stopImmediatePropagation: function () {
            this.isImmediatePropagationStopped = f;
            this.stopPropagation()
        },
        isDefaultPrevented: d,
        isPropagationStopped: d,
        isImmediatePropagationStopped: d
    };
    var Ma = function (a) {
        var b = a.relatedTarget;
        try {
            for (; b && b !== this;) b = b.parentNode;
            if (b !== this) {
                a.type = a.data;
                e.event.handle.apply(this, arguments)
            }
        } catch (k) {}
    },
        Na = function (a) {
            a.type = a.data;
            e.event.handle.apply(this, arguments)
        };e.each({
        mouseenter: "mouseover",
        mouseleave: "mouseout"
    }, function (a, b) {
        e.event.special[a] = {
            setup: function (k) {
                e.event.add(this, b, k && k.selector ? Na : Ma,
                a)
            },
            teardown: function (k) {
                e.event.remove(this, b, k && k.selector ? Na : Ma)
            }
        }
    });
    if (!e.support.submitBubbles) e.event.special.submit = {
        setup: function () {
            if (this.nodeName.toLowerCase() !== "form") {
                e.event.add(this, "click.specialSubmit", function (a) {
                    var b = a.target,
                        k = b.type;
                    if ((k === "submit" || k === "image") && e(b).closest("form").length) return m("submit", this, arguments)
                });
                e.event.add(this, "keypress.specialSubmit", function (a) {
                    var b = a.target,
                        k = b.type;
                    if ((k === "text" || k === "password") && e(b).closest("form").length && a.keyCode === 13) return m("submit", this, arguments)
                })
            } else return false
        },
        teardown: function () {
            e.event.remove(this, ".specialSubmit")
        }
    };
    if (!e.support.changeBubbles) {
        var ya = /textarea|input|select/i,
            za, Oa = function (a) {
                var b = a.type,
                    k = a.value;
                if (b === "radio" || b === "checkbox") k = a.checked;
                else if (b === "select-multiple") k = a.selectedIndex > -1 ? e.map(a.options, function (p) {
                    return p.selected
                }).join("-") : "";
                else if (a.nodeName.toLowerCase() === "select") k = a.selectedIndex;
                return k
            },
            Aa = function (a, b) {
                var k = a.target,
                    p, o;
                if (!(!ya.test(k.nodeName) || k.readOnly)) {
                    p = e.data(k, "_change_data");
                    o = Oa(k);
                    if (a.type !== "focusout" || k.type !== "radio") e.data(k, "_change_data", o);
                    if (!(p === undefined || o === p)) if (p != null || o) {
                        a.type = "change";
                        return e.event.trigger(a, b, k)
                    }
                }
            };
        e.event.special.change = {
            filters: {
                focusout: Aa,
                click: function (a) {
                    var b = a.target,
                        k = b.type;
                    if (k === "radio" || k === "checkbox" || b.nodeName.toLowerCase() === "select") return Aa.call(this, a)
                },
                keydown: function (a) {
                    var b = a.target,
                        k = b.type;
                    if (a.keyCode === 13 && b.nodeName.toLowerCase() !== "textarea" || a.keyCode === 32 && (k === "checkbox" || k === "radio") || k === "select-multiple") return Aa.call(this, a)
                },
                beforeactivate: function (a) {
                    a = a.target;
                    e.data(a, "_change_data", Oa(a))
                }
            },
            setup: function () {
                if (this.type === "file") return false;
                for (var a in za) e.event.add(this, a + ".specialChange", za[a]);
                return ya.test(this.nodeName)
            },
            teardown: function () {
                e.event.remove(this, ".specialChange");
                return ya.test(this.nodeName)
            }
        };
        za = e.event.special.change.filters
    }
    n.addEventListener && e.each({
        focus: "focusin",
        blur: "focusout"
    }, function (a, b) {
        function k(p) {
            p = e.event.fix(p);
            p.type = b;
            return e.event.handle.call(this, p)
        }
        e.event.special[b] = {
            setup: function () {
                this.addEventListener(a, k, true)
            },
            teardown: function () {
                this.removeEventListener(a, k, true)
            }
        }
    });e.each(["bind", "one"], function (a, b) {
        e.fn[b] = function (k, p, o) {
            if (typeof k === "object") {
                for (var z in k) this[b](z, p, k[z], o);
                return this
            }
            if (e.isFunction(p)) {
                o = p;
                p = undefined
            }
            var A = b === "one" ? e.proxy(o, function (E) {
                e(this).unbind(E, A);
                return o.apply(this, arguments)
            }) : o;
            if (k === "unload" && b !== "one") this.one(k, p, o);
            else {
                z = 0;
                for (var I = this.length; z < I; z++) e.event.add(this[z], k, A, p)
            }
            return this
        }
    });e.fn.extend({
        unbind: function (a, b) {
            if (typeof a === "object" && !a.preventDefault) for (var k in a) this.unbind(k, a[k]);
            else {
                k = 0;
                for (var p = this.length; k < p; k++) e.event.remove(this[k], a, b)
            }
            return this
        },
        delegate: function (a, b, k, p) {
            return this.live(b, k, p, a)
        },
        undelegate: function (a, b, k) {
            return arguments.length === 0 ? this.unbind("live") : this.die(b, null, k, a)
        },
        trigger: function (a, b) {
            return this.each(function () {
                e.event.trigger(a, b, this)
            })
        },
        triggerHandler: function (a, b) {
            if (this[0]) {
                a = e.Event(a);
                a.preventDefault();
                a.stopPropagation();
                e.event.trigger(a, b, this[0]);
                return a.result
            }
        },
        toggle: function (a) {
            for (var b = arguments, k = 1; k < b.length;) e.proxy(a, b[k++]);
            return this.click(e.proxy(a, function (p) {
                var o = (e.data(this, "lastToggle" + a.guid) || 0) % k;
                e.data(this, "lastToggle" + a.guid, o + 1);
                p.preventDefault();
                return b[o].apply(this, arguments) || false
            }))
        },
        hover: function (a, b) {
            return this.mouseenter(a).mouseleave(b || a)
        }
    });
    var Pa = {
        focus: "focusin",
        blur: "focusout",
        mouseenter: "mouseover",
        mouseleave: "mouseout"
    };e.each(["live", "die"], function (a, b) {
        e.fn[b] = function (k, p, o, z) {
            var A, I = 0,
                E, H, R = z || this.selector,
                W = z ? this : e(this.context);
            if (e.isFunction(p)) {
                o =
                p;
                p = undefined
            }
            for (k = (k || "").split(" ");
            (A = k[I++]) != null;) {
                z = sa.exec(A);
                E = "";
                if (z) {
                    E = z[0];
                    A = A.replace(sa, "")
                }
                if (A === "hover") k.push("mouseenter" + E, "mouseleave" + E);
                else {
                    H = A;
                    if (A === "focus" || A === "blur") {
                        k.push(Pa[A] + E);
                        A += E
                    } else A = (Pa[A] || A) + E;
                    b === "live" ? W.each(function () {
                        e.event.add(this, g(A, R), {
                            data: p,
                            selector: R,
                            handler: o,
                            origType: A,
                            origHandler: o,
                            preType: H
                        })
                    }) : W.unbind(g(A, R), o)
                }
            }
            return this
        }
    });e.each("blur focus focusin focusout load resize scroll unload click dblclick mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave change select submit keydown keypress keyup error".split(" "), function (a, b) {
        e.fn[b] = function (k) {
            return k ? this.bind(b, k) : this.trigger(b)
        };
        if (e.attrFn) e.attrFn[b] = true
    });window.attachEvent && !window.addEventListener && window.attachEvent("onunload", function () {
        for (var a in e.cache) if (e.cache[a].handle) try {
            e.event.remove(e.cache[a].handle.elem)
        } catch (b) {}
    });
    (function () {
        function a(u) {
            for (var x = "", F, G = 0; u[G]; G++) {
                F = u[G];
                if (F.nodeType === 3 || F.nodeType === 4) x += F.nodeValue;
                else if (F.nodeType !== 8) x += a(F.childNodes)
            }
            return x
        }
        function b(u, x, F, G, N, M) {
            N = 0;
            for (var X = G.length; N < X; N++) {
                var V = G[N];
                if (V) {
                    V = V[u];
                    for (var $ = false; V;) {
                        if (V.sizcache === F) {
                            $ = G[V.sizset];
                            break
                        }
                        if (V.nodeType === 1 && !M) {
                            V.sizcache = F;
                            V.sizset = N
                        }
                        if (V.nodeName.toLowerCase() === x) {
                            $ = V;
                            break
                        }
                        V = V[u]
                    }
                    G[N] = $
                }
            }
        }
        function k(u, x, F, G, N, M) {
            N = 0;
            for (var X = G.length; N < X; N++) {
                var V = G[N];
                if (V) {
                    V = V[u];
                    for (var $ = false; V;) {
                        if (V.sizcache === F) {
                            $ = G[V.sizset];
                            break
                        }
                        if (V.nodeType === 1) {
                            if (!M) {
                                V.sizcache = F;
                                V.sizset = N
                            }
                            if (typeof x !== "string") {
                                if (V === x) {
                                    $ = true;
                                    break
                                }
                            } else if (E.filter(x, [V]).length > 0) {
                                $ = V;
                                break
                            }
                        }
                        V = V[u]
                    }
                    G[N] = $
                }
            }
        }
        var p = /((?:\((?:\([^()]+\)|[^()]+)+\)|\[(?:\[[^[\]]*\]|['"][^'"]*['"]|[^[\]'"]+)+\]|\\.|[^ >+~,(\[\\]+)+|[>+~])(\s*,\s*)?((?:.|\r|\n)*)/g,
            o = 0,
            z = Object.prototype.toString,
            A = false,
            I = true;
        [0, 0].sort(function () {
            I = false;
            return 0
        });
        var E = function (u, x, F, G) {
            F = F || [];
            var N = x = x || n;
            if (x.nodeType !== 1 && x.nodeType !== 9) return [];
            if (!u || typeof u !== "string") return F;
            for (var M = [], X, V, $, ta, oa = true, qa = Y(x), pa = u;
            (p.exec(""), X = p.exec(pa)) !== null;) {
                pa = X[3];
                M.push(X[1]);
                if (X[2]) {
                    ta = X[3];
                    break
                }
            }
            if (M.length > 1 && R.exec(u)) if (M.length === 2 && H.relative[M[0]]) V = Ba(M[0] + M[1], x);
            else for (V = H.relative[M[0]] ? [x] : E(M.shift(), x);M.length;) {
                u = M.shift();
                if (H.relative[u]) u += M.shift();
                V = Ba(u, V)
            } else {
                if (!G && M.length > 1 && x.nodeType === 9 && !qa && H.match.ID.test(M[0]) && !H.match.ID.test(M[M.length - 1])) {
                    X = E.find(M.shift(), x, qa);
                    x = X.expr ? E.filter(X.expr, X.set)[0] : X.set[0]
                }
                if (x) {
                    X = G ? {
                        expr: M.pop(),
                        set: ba(G)
                    } : E.find(M.pop(), M.length === 1 && (M[0] === "~" || M[0] === "+") && x.parentNode ? x.parentNode : x,
                    qa);V = X.expr ? E.filter(X.expr, X.set) : X.set;
                    if (M.length > 0) $ = ba(V);
                    else oa = false;
                    for (; M.length;) {
                        var ia = M.pop();
                        X = ia;
                        if (H.relative[ia]) X = M.pop();
                        else ia = "";
                        if (X == null) X = x;
                        H.relative[ia]($, X, qa)
                    }
                } else $ = []
            }
            $ || ($ = V);
            $ || E.error(ia || u);
            if (z.call($) === "[object Array]") if (oa) if (x && x.nodeType === 1) for (u = 0; $[u] != null; u++) {
                if ($[u] && ($[u] === true || $[u].nodeType === 1 && ja(x, $[u]))) F.push(V[u])
            } else for (u = 0; $[u] != null; u++) $[u] && $[u].nodeType === 1 && F.push(V[u]);
            else F.push.apply(F, $);
            else ba($, F);
            if (ta) {
                E(ta, N, F, G);
                E.uniqueSort(F)
            }
            return F
        };
        E.uniqueSort = function (u) {
            if (da) {
                A = I;
                u.sort(da);
                if (A) for (var x = 1; x < u.length; x++) u[x] === u[x - 1] && u.splice(x--, 1)
            }
            return u
        };
        E.matches = function (u, x) {
            return E(u, null, null, x)
        };
        E.find =

        function (u, x, F) {
            var G, N;
            if (!u) return [];
            for (var M = 0, X = H.order.length; M < X; M++) {
                var V = H.order[M];
                if (N = H.leftMatch[V].exec(u)) {
                    var $ = N[1];
                    N.splice(1, 1);
                    if ($.substr($.length - 1) !== "\\") {
                        N[1] = (N[1] || "").replace(/\\/g, "");
                        G = H.find[V](N, x, F);
                        if (G != null) {
                            u = u.replace(H.match[V], "");
                            break
                        }
                    }
                }
            }
            G || (G = x.getElementsByTagName("*"));
            return {
                set: G,
                expr: u
            }
        };
        E.filter = function (u, x, F, G) {
            for (var N = u, M = [], X = x, V, $, ta = x && x[0] && Y(x[0]); u && x.length;) {
                for (var oa in H.filter) if ((V = H.leftMatch[oa].exec(u)) != null && V[2]) {
                    var qa = H.filter[oa],
                        pa, ia;
                    ia = V[1];
                    $ = false;
                    V.splice(1, 1);
                    if (ia.substr(ia.length - 1) !== "\\") {
                        if (X === M) M = [];
                        if (H.preFilter[oa]) if (V = H.preFilter[oa](V, X, F, M, G, ta)) {
                            if (V === true) continue
                        } else $ = pa = true;
                        if (V) for (var ua = 0;
                        (ia = X[ua]) != null; ua++) if (ia) {
                            pa = qa(ia, V, ua, X);
                            var Qa = G ^ !! pa;
                            if (F && pa != null) if (Qa) $ = true;
                            else X[ua] = false;
                            else if (Qa) {
                                M.push(ia);
                                $ = true
                            }
                        }
                        if (pa !== undefined) {
                            F || (X = M);
                            u = u.replace(H.match[oa], "");
                            if (!$) return [];
                            break
                        }
                    }
                }
                if (u === N) if ($ == null) E.error(u);
                else break;
                N = u
            }
            return X
        };
        E.error = function (u) {
            throw "Syntax error, unrecognized expression: " + u;
        };
        var H = E.selectors = {
            order: ["ID", "NAME", "TAG"],
            match: {
                ID: /#((?:[\w\u00c0-\uFFFF-]|\\.)+)/,
                CLASS: /\.((?:[\w\u00c0-\uFFFF-]|\\.)+)/,
                NAME: /\[name=['"]*((?:[\w\u00c0-\uFFFF-]|\\.)+)['"]*\]/,
                ATTR: /\[\s*((?:[\w\u00c0-\uFFFF-]|\\.)+)\s*(?:(\S?=)\s*(['"]*)(.*?)\3|)\s*\]/,
                TAG: /^((?:[\w\u00c0-\uFFFF\*-]|\\.)+)/,
                CHILD: /:(only|nth|last|first)-child(?:\((even|odd|[\dn+-]*)\))?/,
                POS: /:(nth|eq|gt|lt|first|last|even|odd)(?:\((\d*)\))?(?=[^-]|$)/,
                PSEUDO: /:((?:[\w\u00c0-\uFFFF-]|\\.)+)(?:\((['"]?)((?:\([^\)]+\)|[^\(\)]*)+)\2\))?/
            },
            leftMatch: {},
            attrMap: {
                "class": "className",
                "for": "htmlFor"
            },
            attrHandle: {
                href: function (u) {
                    return u.getAttribute("href")
                }
            },
            relative: {
                "+": function (u, x) {
                    var F = typeof x === "string",
                        G = F && !/\W/.test(x);
                    F = F && !G;
                    if (G) x = x.toLowerCase();
                    G = 0;
                    for (var N = u.length, M; G < N; G++) if (M = u[G]) {
                        for (;
                        (M = M.previousSibling) && M.nodeType !== 1;);
                        u[G] = F || M && M.nodeName.toLowerCase() === x ? M || false : M === x
                    }
                    F && E.filter(x, u, true)
                },
                ">": function (u, x) {
                    var F = typeof x === "string";
                    if (F && !/\W/.test(x)) {
                        x = x.toLowerCase();
                        for (var G = 0, N = u.length; G < N; G++) {
                            var M =
                            u[G];
                            if (M) {
                                F = M.parentNode;
                                u[G] = F.nodeName.toLowerCase() === x ? F : false
                            }
                        }
                    } else {
                        G = 0;
                        for (N = u.length; G < N; G++) if (M = u[G]) u[G] = F ? M.parentNode : M.parentNode === x;F && E.filter(x, u, true)
                    }
                },
                "": function (u, x, F) {
                    var G = o++,
                        N = k;
                    if (typeof x === "string" && !/\W/.test(x)) {
                        var M = x = x.toLowerCase();
                        N = b
                    }
                    N("parentNode", x, G, u, M, F)
                },
                "~": function (u, x, F) {
                    var G = o++,
                        N = k;
                    if (typeof x === "string" && !/\W/.test(x)) {
                        var M = x = x.toLowerCase();
                        N = b
                    }
                    N("previousSibling", x, G, u, M, F)
                }
            },
            find: {
                ID: function (u, x, F) {
                    if (typeof x.getElementById !== "undefined" && !F) return (u = x.getElementById(u[1])) ? [u] : []
                },
                NAME: function (u, x) {
                    if (typeof x.getElementsByName !== "undefined") {
                        var F = [];
                        x = x.getElementsByName(u[1]);
                        for (var G = 0, N = x.length; G < N; G++) x[G].getAttribute("name") === u[1] && F.push(x[G]);
                        return F.length === 0 ? null : F
                    }
                },
                TAG: function (u, x) {
                    return x.getElementsByTagName(u[1])
                }
            },
            preFilter: {
                CLASS: function (u, x, F, G, N, M) {
                    u = " " + u[1].replace(/\\/g, "") + " ";
                    if (M) return u;
                    M = 0;
                    for (var X;
                    (X = x[M]) != null; M++) if (X) if (N ^ (X.className && (" " + X.className + " ").replace(/[\t\n]/g, " ").indexOf(u) >= 0)) F || G.push(X);
                    else if (F) x[M] = false;
                    return false
                },
                ID: function (u) {
                    return u[1].replace(/\\/g, "")
                },
                TAG: function (u) {
                    return u[1].toLowerCase()
                },
                CHILD: function (u) {
                    if (u[1] === "nth") {
                        var x = /(-?)(\d*)n((?:\+|-)?\d*)/.exec(u[2] === "even" && "2n" || u[2] === "odd" && "2n+1" || !/\D/.test(u[2]) && "0n+" + u[2] || u[2]);
                        u[2] = x[1] + (x[2] || 1) - 0;
                        u[3] = x[3] - 0
                    }
                    u[0] = o++;
                    return u
                },
                ATTR: function (u, x, F, G, N, M) {
                    x = u[1].replace(/\\/g, "");
                    if (!M && H.attrMap[x]) u[1] = H.attrMap[x];
                    if (u[2] === "~=") u[4] = " " + u[4] + " ";
                    return u
                },
                PSEUDO: function (u, x, F, G, N) {
                    if (u[1] === "not") if ((p.exec(u[3]) || "").length > 1 || /^\w/.test(u[3])) u[3] = E(u[3], null, null, x);
                    else {
                        u = E.filter(u[3], x, F, true ^ N);
                        F || G.push.apply(G, u);
                        return false
                    } else if (H.match.POS.test(u[0]) || H.match.CHILD.test(u[0])) return true;
                    return u
                },
                POS: function (u) {
                    u.unshift(true);
                    return u
                }
            },
            filters: {
                enabled: function (u) {
                    return u.disabled === false && u.type !== "hidden"
                },
                disabled: function (u) {
                    return u.disabled === true
                },
                checked: function (u) {
                    return u.checked === true
                },
                selected: function (u) {
                    return u.selected === true
                },
                parent: function (u) {
                    return !!u.firstChild
                },
                empty: function (u) {
                    return !u.firstChild
                },
                has: function (u, x, F) {
                    return !!E(F[3], u).length
                },
                header: function (u) {
                    return /h\d/i.test(u.nodeName)
                },
                text: function (u) {
                    return "text" === u.type
                },
                radio: function (u) {
                    return "radio" === u.type
                },
                checkbox: function (u) {
                    return "checkbox" === u.type
                },
                file: function (u) {
                    return "file" === u.type
                },
                password: function (u) {
                    return "password" === u.type
                },
                submit: function (u) {
                    return "submit" === u.type
                },
                image: function (u) {
                    return "image" === u.type
                },
                reset: function (u) {
                    return "reset" === u.type
                },
                button: function (u) {
                    return "button" === u.type || u.nodeName.toLowerCase() === "button"
                },
                input: function (u) {
                    return /input|select|textarea|button/i.test(u.nodeName)
                }
            },
            setFilters: {
                first: function (u, x) {
                    return x === 0
                },
                last: function (u, x, F, G) {
                    return x === G.length - 1
                },
                even: function (u, x) {
                    return x % 2 === 0
                },
                odd: function (u, x) {
                    return x % 2 === 1
                },
                lt: function (u, x, F) {
                    return x < F[3] - 0
                },
                gt: function (u, x, F) {
                    return x > F[3] - 0
                },
                nth: function (u, x, F) {
                    return F[3] - 0 === x
                },
                eq: function (u, x, F) {
                    return F[3] - 0 === x
                }
            },
            filter: {
                PSEUDO: function (u, x, F, G) {
                    var N = x[1],
                        M = H.filters[N];
                    if (M) return M(u, F, x, G);
                    else if (N === "contains") return (u.textContent || u.innerText || a([u]) || "").indexOf(x[3]) >= 0;
                    else if (N === "not") {
                        x = x[3];
                        F = 0;
                        for (G = x.length; F < G; F++) if (x[F] === u) return false;
                        return true
                    } else E.error("Syntax error, unrecognized expression: " + N)
                },
                CHILD: function (u, x) {
                    var F = x[1],
                        G = u;
                    switch (F) {
                    case "only":
                    case "first":
                        for (; G = G.previousSibling;) if (G.nodeType === 1) return false;
                        if (F === "first") return true;
                        G = u;
                    case "last":
                        for (; G = G.nextSibling;) if (G.nodeType === 1) return false;
                        return true;
                    case "nth":
                        F = x[2];
                        var N =
                        x[3];
                        if (F === 1 && N === 0) return true;
                        x = x[0];
                        var M = u.parentNode;
                        if (M && (M.sizcache !== x || !u.nodeIndex)) {
                            var X = 0;
                            for (G = M.firstChild; G; G = G.nextSibling) if (G.nodeType === 1) G.nodeIndex = ++X;
                            M.sizcache = x
                        }
                        u = u.nodeIndex - N;
                        return F === 0 ? u === 0 : u % F === 0 && u / F >= 0
                    }
                },
                ID: function (u, x) {
                    return u.nodeType === 1 && u.getAttribute("id") === x
                },
                TAG: function (u, x) {
                    return x === "*" && u.nodeType === 1 || u.nodeName.toLowerCase() === x
                },
                CLASS: function (u, x) {
                    return (" " + (u.className || u.getAttribute("class")) + " ").indexOf(x) > -1
                },
                ATTR: function (u, x) {
                    var F =
                    x[1];
                    u = H.attrHandle[F] ? H.attrHandle[F](u) : u[F] != null ? u[F] : u.getAttribute(F);F = u + "";
                    var G = x[2];x = x[4];
                    return u == null ? G === "!=" : G === "=" ? F === x : G === "*=" ? F.indexOf(x) >= 0 : G === "~=" ? (" " + F + " ").indexOf(x) >= 0 : !x ? F && u !== false : G === "!=" ? F !== x : G === "^=" ? F.indexOf(x) === 0 : G === "$=" ? F.substr(F.length - x.length) === x : G === "|=" ? F === x || F.substr(0, x.length + 1) === x + "-" : false
                },
                POS: function (u, x, F, G) {
                    var N = H.setFilters[x[2]];
                    if (N) return N(u, F, x, G)
                }
            }
        },
            R = H.match.POS;
        for (var W in H.match) {
            H.match[W] = new RegExp(H.match[W].source + /(?![^\[]*\])(?![^\(]*\))/.source);
            H.leftMatch[W] = new RegExp(/(^(?:.|\r|\n)*?)/.source + H.match[W].source.replace(/\\(\d+)/g, function (u, x) {
                return "\\" + (x - 0 + 1)
            }))
        }
        var ba = function (u, x) {
            u = Array.prototype.slice.call(u, 0);
            if (x) {
                x.push.apply(x, u);
                return x
            }
            return u
        };
        try {
            Array.prototype.slice.call(n.documentElement.childNodes, 0)
        } catch (ea) {
            ba = function (u, x) {
                x = x || [];
                if (z.call(u) === "[object Array]") Array.prototype.push.apply(x, u);
                else if (typeof u.length === "number") for (var F = 0, G = u.length; F < G; F++) x.push(u[F]);
                else for (F = 0; u[F]; F++) x.push(u[F]);
                return x
            }
        }
        var da;
        if (n.documentElement.compareDocumentPosition) da = function (u, x) {
            if (!u.compareDocumentPosition || !x.compareDocumentPosition) {
                if (u == x) A = true;
                return u.compareDocumentPosition ? -1 : 1
            }
            u = u.compareDocumentPosition(x) & 4 ? -1 : u === x ? 0 : 1;
            if (u === 0) A = true;
            return u
        };
        else if ("sourceIndex" in n.documentElement) da = function (u, x) {
            if (!u.sourceIndex || !x.sourceIndex) {
                if (u == x) A = true;
                return u.sourceIndex ? -1 : 1
            }
            u = u.sourceIndex - x.sourceIndex;
            if (u === 0) A = true;
            return u
        };
        else if (n.createRange) da = function (u, x) {
            if (!u.ownerDocument || !x.ownerDocument) {
                if (u == x) A = true;
                return u.ownerDocument ? -1 : 1
            }
            var F = u.ownerDocument.createRange(),
                G = x.ownerDocument.createRange();
            F.setStart(u, 0);
            F.setEnd(u, 0);
            G.setStart(x, 0);
            G.setEnd(x, 0);
            u = F.compareBoundaryPoints(Range.START_TO_END, G);
            if (u === 0) A = true;
            return u
        };
        (function () {
            var u = n.createElement("div"),
                x = "script" + (new Date).getTime();
            u.innerHTML = "<a name='" + x + "'/>";
            var F = n.documentElement;
            F.insertBefore(u, F.firstChild);
            if (n.getElementById(x)) {
                H.find.ID = function (G, N, M) {
                    if (typeof N.getElementById !== "undefined" && !M) return (N =
                    N.getElementById(G[1])) ? N.id === G[1] || typeof N.getAttributeNode !== "undefined" && N.getAttributeNode("id").nodeValue === G[1] ? [N] : undefined : []
                };
                H.filter.ID = function (G, N) {
                    var M = typeof G.getAttributeNode !== "undefined" && G.getAttributeNode("id");
                    return G.nodeType === 1 && M && M.nodeValue === N
                }
            }
            F.removeChild(u);
            F = u = null
        })();
        (function () {
            var u = n.createElement("div");
            u.appendChild(n.createComment(""));
            if (u.getElementsByTagName("*").length > 0) H.find.TAG = function (x, F) {
                F = F.getElementsByTagName(x[1]);
                if (x[1] === "*") {
                    x = [];
                    for (var G = 0; F[G]; G++) F[G].nodeType === 1 && x.push(F[G]);
                    F = x
                }
                return F
            };
            u.innerHTML = "<a href='#'></a>";
            if (u.firstChild && typeof u.firstChild.getAttribute !== "undefined" && u.firstChild.getAttribute("href") !== "#") H.attrHandle.href = function (x) {
                return x.getAttribute("href", 2)
            };
            u = null
        })();
        n.querySelectorAll &&
        function () {
            var u = E,
                x = n.createElement("div");
            x.innerHTML = "<p class='TEST'></p>";
            if (!(x.querySelectorAll && x.querySelectorAll(".TEST").length === 0)) {
                E = function (G, N, M, X) {
                    N = N || n;
                    if (!X && N.nodeType === 9 && !Y(N)) try {
                        return ba(N.querySelectorAll(G), M)
                    } catch (V) {}
                    return u(G, N, M, X)
                };
                for (var F in u) E[F] = u[F];
                x = null
            }
        }();
        (function () {
            var u = n.createElement("div");
            u.innerHTML = "<div class='test e'></div><div class='test'></div>";
            if (!(!u.getElementsByClassName || u.getElementsByClassName("e").length === 0)) {
                u.lastChild.className = "e";
                if (u.getElementsByClassName("e").length !== 1) {
                    H.order.splice(1, 0, "CLASS");
                    H.find.CLASS = function (x, F, G) {
                        if (typeof F.getElementsByClassName !== "undefined" && !G) return F.getElementsByClassName(x[1])
                    };
                    u = null
                }
            }
        })();
        var ja = n.compareDocumentPosition ?
        function (u, x) {
            return !!(u.compareDocumentPosition(x) & 16)
        } : function (u, x) {
            return u !== x && (u.contains ? u.contains(x) : true)
        },
            Y = function (u) {
                return (u = (u ? u.ownerDocument || u : 0).documentElement) ? u.nodeName !== "HTML" : false
            },
            Ba = function (u, x) {
                var F = [],
                    G = "",
                    N;
                for (x = x.nodeType ? [x] : x;N = H.match.PSEUDO.exec(u);) {
                    G += N[0];
                    u = u.replace(H.match.PSEUDO, "")
                }
                u = H.relative[u] ? u + "*" : u;N = 0;
                for (var M = x.length; N < M; N++) E(u, x[N], F);
                return E.filter(G, F)
            };e.find = E;e.expr = E.selectors;e.expr[":"] = e.expr.filters;e.unique = E.uniqueSort;e.text =
        a;e.isXMLDoc = Y;e.contains = ja
    })();
    var eb = /Until$/,
        fb = /^(?:parents|prevUntil|prevAll)/,
        gb = /,/;O = Array.prototype.slice;
    var Ra = function (a, b, k) {
        if (e.isFunction(b)) return e.grep(a, function (o, z) {
            return !!b.call(o, z, o) === k
        });
        else if (b.nodeType) return e.grep(a, function (o) {
            return o === b === k
        });
        else if (typeof b === "string") {
            var p = e.grep(a, function (o) {
                return o.nodeType === 1
            });
            if (J.test(b)) return e.filter(b, p, !k);
            else b = e.filter(b, p)
        }
        return e.grep(a, function (o) {
            return e.inArray(o, b) >= 0 === k
        })
    };e.fn.extend({
        find: function (a) {
            for (var b =
            this.pushStack("", "find", a), k = 0, p = 0, o = this.length; p < o; p++) {
                k = b.length;
                e.find(a, this[p], b);
                if (p > 0) for (var z = k; z < b.length; z++) for (var A = 0; A < k; A++) if (b[A] === b[z]) {
                    b.splice(z--, 1);
                    break
                }
            }
            return b
        },
        has: function (a) {
            var b = e(a);
            return this.filter(function () {
                for (var k = 0, p = b.length; k < p; k++) if (e.contains(this, b[k])) return true
            })
        },
        not: function (a) {
            return this.pushStack(Ra(this, a, false), "not", a)
        },
        filter: function (a) {
            return this.pushStack(Ra(this, a, true), "filter", a)
        },
        is: function (a) {
            return !!a && e.filter(a, this).length > 0
        },
        closest: function (a, b) {
            if (e.isArray(a)) {
                var k = [],
                    p = this[0],
                    o, z = {},
                    A;
                if (p && a.length) {
                    o = 0;
                    for (var I = a.length; o < I; o++) {
                        A = a[o];
                        z[A] || (z[A] = e.expr.match.POS.test(A) ? e(A, b || this.context) : A)
                    }
                    for (; p && p.ownerDocument && p !== b;) {
                        for (A in z) {
                            o = z[A];
                            if (o.jquery ? o.index(p) > -1 : e(p).is(o)) {
                                k.push({
                                    selector: A,
                                    elem: p
                                });
                                delete z[A]
                            }
                        }
                        p = p.parentNode
                    }
                }
                return k
            }
            var E = e.expr.match.POS.test(a) ? e(a, b || this.context) : null;
            return this.map(function (H, R) {
                for (; R && R.ownerDocument && R !== b;) {
                    if (E ? E.index(R) > -1 : e(R).is(a)) return R;
                    R = R.parentNode
                }
                return null
            })
        },
        index: function (a) {
            if (!a || typeof a === "string") return e.inArray(this[0], a ? e(a) : this.parent().children());
            return e.inArray(a.jquery ? a[0] : a,
            this)
        },
        add: function (a, b) {
            a = typeof a === "string" ? e(a, b || this.context) : e.makeArray(a);b = e.merge(this.get(), a);
            return this.pushStack(j(a[0]) || j(b[0]) ? b : e.unique(b))
        },
        andSelf: function () {
            return this.add(this.prevObject)
        }
    });e.each({
        parent: function (a) {
            return (a = a.parentNode) && a.nodeType !== 11 ? a : null
        },
        parents: function (a) {
            return e.dir(a, "parentNode")
        },
        parentsUntil: function (a, b, k) {
            return e.dir(a, "parentNode", k)
        },
        next: function (a) {
            return e.nth(a, 2, "nextSibling")
        },
        prev: function (a) {
            return e.nth(a, 2, "previousSibling")
        },
        nextAll: function (a) {
            return e.dir(a, "nextSibling")
        },
        prevAll: function (a) {
            return e.dir(a, "previousSibling")
        },
        nextUntil: function (a, b, k) {
            return e.dir(a, "nextSibling", k)
        },
        prevUntil: function (a, b, k) {
            return e.dir(a, "previousSibling", k)
        },
        siblings: function (a) {
            return e.sibling(a.parentNode.firstChild, a)
        },
        children: function (a) {
            return e.sibling(a.firstChild)
        },
        contents: function (a) {
            return e.nodeName(a, "iframe") ? a.contentDocument || a.contentWindow.document : e.makeArray(a.childNodes)
        }
    }, function (a, b) {
        e.fn[a] = function (k, p) {
            var o = e.map(this, b, k);
            eb.test(a) || (p = k);
            if (p && typeof p === "string") o = e.filter(p, o);
            o = this.length > 1 ? e.unique(o) : o;
            if ((this.length > 1 || gb.test(p)) && fb.test(a)) o = o.reverse();
            return this.pushStack(o, a, O.call(arguments).join(","))
        }
    });e.extend({
        filter: function (a, b, k) {
            if (k) a = ":not(" + a + ")";
            return e.find.matches(a, b)
        },
        dir: function (a, b, k) {
            var p = [];
            for (a =
            a[b]; a && a.nodeType !== 9 && (k === undefined || a.nodeType !== 1 || !e(a).is(k));) {
                a.nodeType === 1 && p.push(a);
                a = a[b]
            }
            return p
        },
        nth: function (a, b, k) {
            b = b || 1;
            for (var p = 0; a; a = a[k]) if (a.nodeType === 1 && ++p === b) break;
            return a
        },
        sibling: function (a, b) {
            for (var k = []; a; a = a.nextSibling) a.nodeType === 1 && a !== b && k.push(a);
            return k
        }
    });
    var Sa = / jQuery\d+="(?:\d+|null)"/g,
        va = /^\s+/,
        Ta = /(<([\w:]+)[^>]*?)\/>/g,
        hb = /^(?:area|br|col|embed|hr|img|input|link|meta|param)$/i,
        Ua = /<([\w:]+)/,
        ib = /<tbody/i,
        jb = /<|&#?\w+;/,
        Ha = /<script|<object|<embed|<option|<style/i,
        Ia = /checked\s*(?:[^=]|=\s*.checked.)/i,
        Va = function (a, b, k) {
            return hb.test(k) ? a : b + "></" + k + ">"
        },
        ka = {
            option: [1, "<select multiple='multiple'>", "</select>"],
            legend: [1, "<fieldset>", "</fieldset>"],
            thead: [1, "<table>", "</table>"],
            tr: [2, "<table><tbody>", "</tbody></table>"],
            td: [3, "<table><tbody><tr>", "</tr></tbody></table>"],
            col: [2, "<table><tbody></tbody><colgroup>", "</colgroup></table>"],
            area: [1, "<map>", "</map>"],
            _default: [0, "", ""]
        };ka.optgroup = ka.option;ka.tbody = ka.tfoot = ka.colgroup = ka.caption = ka.thead;ka.th =
    ka.td;
    if (!e.support.htmlSerialize) ka._default = [1, "div<div>", "</div>"];e.fn.extend({
        text: function (a) {
            if (e.isFunction(a)) return this.each(function (b) {
                var k = e(this);
                k.text(a.call(this, b, k.text()))
            });
            if (typeof a !== "object" && a !== undefined) return this.empty().append((this[0] && this[0].ownerDocument || n).createTextNode(a));
            return e.text(this)
        },
        wrapAll: function (a) {
            if (e.isFunction(a)) return this.each(function (k) {
                e(this).wrapAll(a.call(this, k))
            });
            if (this[0]) {
                var b = e(a, this[0].ownerDocument).eq(0).clone(true);
                this[0].parentNode && b.insertBefore(this[0]);
                b.map(function () {
                    for (var k = this; k.firstChild && k.firstChild.nodeType === 1;) k = k.firstChild;
                    return k
                }).append(this)
            }
            return this
        },
        wrapInner: function (a) {
            if (e.isFunction(a)) return this.each(function (b) {
                e(this).wrapInner(a.call(this, b))
            });
            return this.each(function () {
                var b = e(this),
                    k = b.contents();
                k.length ? k.wrapAll(a) : b.append(a)
            })
        },
        wrap: function (a) {
            return this.each(function () {
                e(this).wrapAll(a)
            })
        },
        unwrap: function () {
            return this.parent().each(function () {
                e.nodeName(this, "body") || e(this).replaceWith(this.childNodes)
            }).end()
        },
        append: function () {
            return this.domManip(arguments, true, function (a) {
                this.nodeType === 1 && this.appendChild(a)
            })
        },
        prepend: function () {
            return this.domManip(arguments, true, function (a) {
                this.nodeType === 1 && this.insertBefore(a, this.firstChild)
            })
        },
        before: function () {
            if (this[0] && this[0].parentNode) return this.domManip(arguments, false, function (b) {
                this.parentNode.insertBefore(b, this)
            });
            else if (arguments.length) {
                var a = e(arguments[0]);
                a.push.apply(a, this.toArray());
                return this.pushStack(a, "before", arguments)
            }
        },
        after: function () {
            if (this[0] && this[0].parentNode) return this.domManip(arguments, false, function (b) {
                this.parentNode.insertBefore(b, this.nextSibling)
            });
            else if (arguments.length) {
                var a = this.pushStack(this, "after", arguments);
                a.push.apply(a, e(arguments[0]).toArray());
                return a
            }
        },
        remove: function (a, b) {
            for (var k = 0, p;
            (p = this[k]) != null; k++) if (!a || e.filter(a, [p]).length) {
                if (!b && p.nodeType === 1) {
                    e.cleanData(p.getElementsByTagName("*"));
                    e.cleanData([p])
                }
                p.parentNode && p.parentNode.removeChild(p)
            }
            return this
        },
        empty: function () {
            for (var a = 0, b;
            (b = this[a]) != null; a++) for (b.nodeType === 1 && e.cleanData(b.getElementsByTagName("*")); b.firstChild;) b.removeChild(b.firstChild);
            return this
        },
        clone: function (a) {
            var b = this.map(function () {
                if (!e.support.noCloneEvent && !e.isXMLDoc(this)) {
                    var k = this.outerHTML,
                        p = this.ownerDocument;
                    if (!k) {
                        k = p.createElement("div");
                        k.appendChild(this.cloneNode(true));
                        k = k.innerHTML
                    }
                    return e.clean([k.replace(Sa, "").replace(/=([^="'>\s]+\/)>/g, '="$1">').replace(va, "")], p)[0]
                } else return this.cloneNode(true)
            });
            if (a === true) {
                q(this, b);
                q(this.find("*"), b.find("*"))
            }
            return b
        },
        html: function (a) {
            if (a === undefined) return this[0] && this[0].nodeType === 1 ? this[0].innerHTML.replace(Sa, "") : null;
            else if (typeof a === "string" && !Ha.test(a) && (e.support.leadingWhitespace || !va.test(a)) && !ka[(Ua.exec(a) || ["", ""])[1].toLowerCase()]) {
                a = a.replace(Ta, Va);
                try {
                    for (var b = 0, k = this.length; b < k; b++) if (this[b].nodeType === 1) {
                        e.cleanData(this[b].getElementsByTagName("*"));
                        this[b].innerHTML = a
                    }
                } catch (p) {
                    this.empty().append(a)
                }
            } else e.isFunction(a) ? this.each(function (o) {
                var z = e(this),
                    A = z.html();
                z.empty().append(function () {
                    return a.call(this, o, A)
                })
            }) : this.empty().append(a);
            return this
        },
        replaceWith: function (a) {
            if (this[0] && this[0].parentNode) {
                if (e.isFunction(a)) return this.each(function (b) {
                    var k = e(this),
                        p = k.html();
                    k.replaceWith(a.call(this, b, p))
                });
                if (typeof a !== "string") a = e(a).detach();
                return this.each(function () {
                    var b = this.nextSibling,
                        k = this.parentNode;
                    e(this).remove();
                    b ? e(b).before(a) : e(k).append(a)
                })
            } else return this.pushStack(e(e.isFunction(a) ? a() : a), "replaceWith", a)
        },
        detach: function (a) {
            return this.remove(a, true)
        },
        domManip: function (a, b, k) {
            function p(W) {
                return e.nodeName(W, "table") ? W.getElementsByTagName("tbody")[0] || W.appendChild(W.ownerDocument.createElement("tbody")) : W
            }
            var o, z, A = a[0],
                I = [],
                E;
            if (!e.support.checkClone && arguments.length === 3 && typeof A === "string" && Ia.test(A)) return this.each(function () {
                e(this).domManip(a, b, k, true)
            });
            if (e.isFunction(A)) return this.each(function (W) {
                var ba = e(this);
                a[0] = A.call(this, W, b ? ba.html() : undefined);
                ba.domManip(a, b, k)
            });
            if (this[0]) {
                o = A && A.parentNode;
                o = e.support.parentNode && o && o.nodeType === 11 && o.childNodes.length === this.length ? {
                    fragment: o
                } : t(a, this, I);E = o.fragment;
                if (z = E.childNodes.length === 1 ? (E = E.firstChild) : E.firstChild) {
                    b = b && e.nodeName(z, "tr");
                    for (var H = 0, R = this.length; H < R; H++) k.call(b ? p(this[H], z) : this[H],
                    H > 0 || o.cacheable || this.length > 1 ? E.cloneNode(true) : E)
                }
                I.length && e.each(I, r)
            }
            return this
        }
    });e.fragments = {};e.each({
        appendTo: "append",
        prependTo: "prepend",
        insertBefore: "before",
        insertAfter: "after",
        replaceAll: "replaceWith"
    }, function (a, b) {
        e.fn[a] = function (k) {
            var p = [];
            k = e(k);
            var o = this.length === 1 && this[0].parentNode;
            if (o && o.nodeType === 11 && o.childNodes.length === 1 && k.length === 1) {
                k[b](this[0]);
                return this
            } else {
                o = 0;
                for (var z = k.length; o < z; o++) {
                    var A = (o > 0 ? this.clone(true) : this).get();
                    e.fn[b].apply(e(k[o]), A);
                    p = p.concat(A)
                }
                return this.pushStack(p, a, k.selector)
            }
        }
    });e.extend({
        clean: function (a, b, k, p) {
            b = b || n;
            if (typeof b.createElement === "undefined") b = b.ownerDocument || b[0] && b[0].ownerDocument || n;
            for (var o = [], z = 0, A;
            (A = a[z]) != null; z++) {
                if (typeof A === "number") A += "";
                if (A) {
                    if (typeof A === "string" && !jb.test(A)) A = b.createTextNode(A);
                    else if (typeof A === "string") {
                        A = A.replace(Ta, Va);
                        var I = (Ua.exec(A) || ["", ""])[1].toLowerCase(),
                            E = ka[I] || ka._default,
                            H = E[0],
                            R = b.createElement("div");
                        for (R.innerHTML = E[1] + A + E[2]; H--;) R = R.lastChild;
                        if (!e.support.tbody) {
                            H = ib.test(A);
                            I = I === "table" && !H ? R.firstChild && R.firstChild.childNodes : E[1] === "<table>" && !H ? R.childNodes : [];
                            for (E = I.length - 1; E >= 0; --E) e.nodeName(I[E], "tbody") && !I[E].childNodes.length && I[E].parentNode.removeChild(I[E])
                        }!e.support.leadingWhitespace && va.test(A) && R.insertBefore(b.createTextNode(va.exec(A)[0]), R.firstChild);
                        A = R.childNodes
                    }
                    if (A.nodeType) o.push(A);
                    else o = e.merge(o, A)
                }
            }
            if (k) for (z = 0; o[z]; z++) if (p && e.nodeName(o[z], "script") && (!o[z].type || o[z].type.toLowerCase() === "text/javascript")) p.push(o[z].parentNode ? o[z].parentNode.removeChild(o[z]) : o[z]);
            else {
                o[z].nodeType === 1 && o.splice.apply(o, [z + 1, 0].concat(e.makeArray(o[z].getElementsByTagName("script"))));
                k.appendChild(o[z])
            }
            return o
        },
        cleanData: function (a) {
            for (var b, k, p = e.cache, o = e.event.special, z = e.support.deleteExpando, A = 0, I;
            (I = a[A]) != null; A++) if (k = I[e.expando]) {
                b = p[k];
                if (b.events) for (var E in b.events) o[E] ? e.event.remove(I, E) : La(I, E, b.handle);
                if (z) delete I[e.expando];
                else I.removeAttribute && I.removeAttribute(e.expando);delete p[k]
            }
        }
    });
    var kb = /z-?index|font-?weight|opacity|zoom|line-?height/i,
        Wa = /alpha\([^)]*\)/,
        Xa = /opacity=([^)]*)/,
        Ca = /float/i,
        Da = /-([a-z])/ig,
        lb = /([A-Z])/g,
        mb = /^-?\d+(?:px)?$/i,
        nb = /^-?\d/,
        ob = {
            position: "absolute",
            visibility: "hidden",
            display: "block"
        },
        pb = ["Left", "Right"],
        qb = ["Top", "Bottom"],
        rb = n.defaultView && n.defaultView.getComputedStyle,
        Ya = e.support.cssFloat ? "cssFloat" : "styleFloat",
        Ea = function (a, b) {
            return b.toUpperCase()
        };e.fn.css = function (a, b) {
        return l(this, a, b, true, function (k, p, o) {
            if (o === undefined) return e.curCSS(k, p);
            if (typeof o === "number" && !kb.test(p)) o += "px";
            e.style(k, p, o)
        })
    };e.extend({
        style: function (a, b, k) {
            if (!(!a || a.nodeType === 3 || a.nodeType === 8)) {
                if ((b === "width" || b === "height") && parseFloat(k) < 0) k = undefined;
                var p = a.style || a,
                    o = k !== undefined;
                if (!e.support.opacity && b === "opacity") {
                    if (o) {
                        p.zoom = 1;
                        b = parseInt(k, 10) + "" === "NaN" ? "" : "alpha(opacity=" + k * 100 + ")";a = p.filter || e.curCSS(a, "filter") || "";p.filter = Wa.test(a) ? a.replace(Wa, b) : b
                    }
                    return p.filter && p.filter.indexOf("opacity=") >= 0 ? parseFloat(Xa.exec(p.filter)[1]) / 100 + "" : ""
                }
                if (Ca.test(b)) b = Ya;
                b = b.replace(Da, Ea);
                if (o) p[b] = k;
                return p[b]
            }
        },
        css: function (a, b, k, p) {
            if (b === "width" || b === "height") {
                var o, z = b === "width" ? pb : qb;k = function () {
                    o = b === "width" ? a.offsetWidth : a.offsetHeight;p !== "border" && e.each(z, function () {
                        p || (o -= parseFloat(e.curCSS(a, "padding" + this, true)) || 0);
                        if (p === "margin") o += parseFloat(e.curCSS(a, "margin" + this, true)) || 0;
                        else o -= parseFloat(e.curCSS(a, "border" + this + "Width", true)) || 0
                    })
                };a.offsetWidth !== 0 ? k() : e.swap(a, ob, k);
                return Math.max(0, Math.round(o))
            }
            return e.curCSS(a, b, k)
        },
        curCSS: function (a, b, k) {
            var p, o = a.style;
            if (!e.support.opacity && b === "opacity" && a.currentStyle) {
                p = Xa.test(a.currentStyle.filter || "") ? parseFloat(RegExp.$1) / 100 + "" : "";
                return p === "" ? "1" : p
            }
            if (Ca.test(b)) b = Ya;
            if (!k && o && o[b]) p = o[b];
            else if (rb) {
                if (Ca.test(b)) b = "float";
                b = b.replace(lb, "-$1").toLowerCase();
                o = a.ownerDocument.defaultView;
                if (!o) return null;
                if (a = o.getComputedStyle(a, null)) p = a.getPropertyValue(b);
                if (b === "opacity" && p === "") p = "1"
            } else if (a.currentStyle) {
                k = b.replace(Da, Ea);
                p = a.currentStyle[b] || a.currentStyle[k];
                if (!mb.test(p) && nb.test(p)) {
                    b = o.left;
                    var z = a.runtimeStyle.left;
                    a.runtimeStyle.left = a.currentStyle.left;
                    o.left = k === "fontSize" ? "1em" : p || 0;p = o.pixelLeft + "px";o.left = b;a.runtimeStyle.left = z
                }
            }
            return p
        },
        swap: function (a, b, k) {
            var p = {};
            for (var o in b) {
                p[o] =
                a.style[o];
                a.style[o] = b[o]
            }
            k.call(a);
            for (o in b) a.style[o] = p[o]
        }
    });
    if (e.expr && e.expr.filters) {
        e.expr.filters.hidden = function (a) {
            var b = a.offsetWidth,
                k = a.offsetHeight,
                p = a.nodeName.toLowerCase() === "tr";
            return b === 0 && k === 0 && !p ? true : b > 0 && k > 0 && !p ? false : e.curCSS(a, "display") === "none"
        };
        e.expr.filters.visible = function (a) {
            return !e.expr.filters.hidden(a)
        }
    }
    var sb = h(),
        tb = /<script(.|\s)*?\/script>/gi,
        ub = /select|textarea/i,
        vb = /color|date|datetime|email|hidden|month|number|password|range|search|tel|text|time|url|week/i,
        ra = /=\?(&|$)/,
        Fa = /\?/,
        wb = /(\?|&)_=.*?(&|$)/,
        xb = /^(\w+:)?\/\/([^\/?#]+)/,
        yb = /%20/g,
        zb = e.fn.load;e.fn.extend({
        load: function (a, b, k) {
            if (typeof a !== "string") return zb.call(this, a);
            else if (!this.length) return this;
            var p = a.indexOf(" ");
            if (p >= 0) {
                var o = a.slice(p, a.length);
                a = a.slice(0, p)
            }
            p = "GET";
            if (b) if (e.isFunction(b)) {
                k = b;
                b = null
            } else if (typeof b === "object") {
                b = e.param(b, e.ajaxSettings.traditional);
                p = "POST"
            }
            var z = this;
            e.ajax({
                url: a,
                type: p,
                dataType: "html",
                data: b,
                complete: function (A, I) {
                    if (I === "success" || I === "notmodified") z.html(o ? e("<div />").append(A.responseText.replace(tb, "")).find(o) : A.responseText);
                    k && z.each(k, [A.responseText, I, A])
                }
            });
            return this
        },
        serialize: function () {
            return e.param(this.serializeArray())
        },
        serializeArray: function () {
            return this.map(function () {
                return this.elements ? e.makeArray(this.elements) : this
            }).filter(function () {
                return this.name && !this.disabled && (this.checked || ub.test(this.nodeName) || vb.test(this.type))
            }).map(function (a, b) {
                a = e(this).val();
                return a == null ? null : e.isArray(a) ? e.map(a, function (k) {
                    return {
                        name: b.name,
                        value: k
                    }
                }) : {
                    name: b.name,
                    value: a
                }
            }).get()
        }
    });e.each("ajaxStart ajaxStop ajaxComplete ajaxError ajaxSuccess ajaxSend".split(" "), function (a, b) {
        e.fn[b] = function (k) {
            return this.bind(b, k)
        }
    });e.extend({
        get: function (a, b, k, p) {
            if (e.isFunction(b)) {
                p = p || k;
                k = b;
                b = null
            }
            return e.ajax({
                type: "GET",
                url: a,
                data: b,
                success: k,
                dataType: p
            })
        },
        getScript: function (a, b) {
            return e.get(a, null, b, "script")
        },
        getJSON: function (a, b, k) {
            return e.get(a, b, k, "json")
        },
        post: function (a, b, k, p) {
            if (e.isFunction(b)) {
                p =
                p || k;
                k = b;
                b = {}
            }
            return e.ajax({
                type: "POST",
                url: a,
                data: b,
                success: k,
                dataType: p
            })
        },
        ajaxSetup: function (a) {
            e.extend(e.ajaxSettings, a)
        },
        ajaxSettings: {
            url: location.href,
            global: true,
            type: "GET",
            contentType: "application/x-www-form-urlencoded",
            processData: true,
            async: true,
            xhr: window.XMLHttpRequest && (window.location.protocol !== "file:" || !window.ActiveXObject) ?
            function () {
                return new window.XMLHttpRequest
            } : function () {
                try {
                    return new window.ActiveXObject("Microsoft.XMLHTTP")
                } catch (a) {}
            },
            accepts: {
                xml: "application/xml, text/xml",
                html: "text/html",
                script: "text/javascript, application/javascript",
                json: "application/json, text/javascript",
                text: "text/plain",
                _default: "*/*"
            }
        },
        lastModified: {},
        etag: {},
        ajax: function (a) {
            function b() {
                o.success && o.success.call(E, I, A, Y);
                o.global && p("ajaxSuccess", [Y, o])
            }
            function k() {
                o.complete && o.complete.call(E, Y, A);
                o.global && p("ajaxComplete", [Y, o]);
                o.global && !--e.active && e.event.trigger("ajaxStop")
            }
            function p(N, M) {
                (o.context ? e(o.context) : e.event).trigger(N, M)
            }
            var o = e.extend(true, {}, e.ajaxSettings, a),
                z, A, I, E = a && a.context || o,
                H = o.type.toUpperCase();
            if (o.data && o.processData && typeof o.data !== "string") o.data = e.param(o.data, o.traditional);
            if (o.dataType === "jsonp") {
                if (H === "GET") ra.test(o.url) || (o.url += (Fa.test(o.url) ? "&" : "?") + (o.jsonp || "callback") + "=?");
                else if (!o.data || !ra.test(o.data)) o.data = (o.data ? o.data + "&" : "") + (o.jsonp || "callback") + "=?";
                o.dataType = "json"
            }
            if (o.dataType === "json" && (o.data && ra.test(o.data) || ra.test(o.url))) {
                z = o.jsonpCallback || "jsonp" + sb++;
                if (o.data) o.data = (o.data + "").replace(ra, "=" + z + "$1");
                o.url = o.url.replace(ra, "=" + z + "$1");
                o.dataType = "script";
                window[z] = window[z] ||
                function (N) {
                    I = N;
                    b();
                    k();
                    window[z] = undefined;
                    try {
                        delete window[z]
                    } catch (M) {}
                    ba && ba.removeChild(ea)
                }
            }
            if (o.dataType === "script" && o.cache === null) o.cache = false;
            if (o.cache === false && H === "GET") {
                var R = h(),
                    W = o.url.replace(wb, "$1_=" + R + "$2");
                o.url = W + (W === o.url ? (Fa.test(o.url) ? "&" : "?") + "_=" + R : "")
            }
            if (o.data && H === "GET") o.url += (Fa.test(o.url) ? "&" : "?") + o.data;
            o.global && !e.active++ && e.event.trigger("ajaxStart");
            R = (R = xb.exec(o.url)) && (R[1] && R[1] !== location.protocol || R[2] !== location.host);
            if (o.dataType === "script" && H === "GET" && R) {
                var ba = n.getElementsByTagName("head")[0] || n.documentElement,
                    ea = n.createElement("script");
                ea.src = o.url;
                if (o.scriptCharset) ea.charset = o.scriptCharset;
                if (!z) {
                    var da = false;
                    ea.onload = ea.onreadystatechange = function () {
                        if (!da && (!this.readyState || this.readyState === "loaded" || this.readyState === "complete")) {
                            da = true;
                            b();
                            k();
                            ea.onload = ea.onreadystatechange = null;
                            ba && ea.parentNode && ba.removeChild(ea)
                        }
                    }
                }
                ba.insertBefore(ea, ba.firstChild)
            } else {
                var ja =
                false,
                    Y = o.xhr();
                if (Y) {
                    o.username ? Y.open(H, o.url, o.async, o.username, o.password) : Y.open(H, o.url, o.async);
                    try {
                        if (o.data || a && a.contentType) Y.setRequestHeader("Content-Type", o.contentType);
                        if (o.ifModified) {
                            e.lastModified[o.url] && Y.setRequestHeader("If-Modified-Since", e.lastModified[o.url]);
                            e.etag[o.url] && Y.setRequestHeader("If-None-Match", e.etag[o.url])
                        }
                        R || Y.setRequestHeader("X-Requested-With", "XMLHttpRequest");
                        Y.setRequestHeader("Accept", o.dataType && o.accepts[o.dataType] ? o.accepts[o.dataType] + ", */*" : o.accepts._default)
                    } catch (Ba) {}
                    if (o.beforeSend && o.beforeSend.call(E, Y, o) === false) {
                        o.global && !--e.active && e.event.trigger("ajaxStop");
                        Y.abort();
                        return false
                    }
                    o.global && p("ajaxSend", [Y, o]);
                    var u = Y.onreadystatechange = function (N) {
                        if (!Y || Y.readyState === 0 || N === "abort") {
                            ja || k();
                            ja = true;
                            if (Y) Y.onreadystatechange = e.noop
                        } else if (!ja && Y && (Y.readyState === 4 || N === "timeout")) {
                            ja = true;
                            Y.onreadystatechange = e.noop;
                            A = N === "timeout" ? "timeout" : !e.httpSuccess(Y) ? "error" : o.ifModified && e.httpNotModified(Y, o.url) ? "notmodified" : "success";
                            var M;
                            if (A === "success") try {
                                I = e.httpData(Y, o.dataType, o)
                            } catch (X) {
                                A = "parsererror";
                                M = X
                            }
                            if (A === "success" || A === "notmodified") z || b();
                            else e.handleError(o, Y, A, M);k();N === "timeout" && Y.abort();
                            if (o.async) Y = null
                        }
                    };
                    try {
                        var x = Y.abort;
                        Y.abort = function () {
                            Y && x.call(Y);
                            u("abort")
                        }
                    } catch (F) {}
                    o.async && o.timeout > 0 && setTimeout(function () {
                        Y && !ja && u("timeout")
                    }, o.timeout);
                    try {
                        Y.send(H === "POST" || H === "PUT" || H === "DELETE" ? o.data : null)
                    } catch (G) {
                        e.handleError(o, Y, null, G);
                        k()
                    }
                    o.async || u();
                    return Y
                }
            }
        },
        handleError: function (a, b, k, p) {
            if (a.error) a.error.call(a.context || a, b, k, p);
            if (a.global)(a.context ? e(a.context) : e.event).trigger("ajaxError", [b, a, p])
        },
        active: 0,
        httpSuccess: function (a) {
            try {
                return !a.status && location.protocol === "file:" || a.status >= 200 && a.status < 300 || a.status === 304 || a.status === 1223 || a.status === 0
            } catch (b) {}
            return false
        },
        httpNotModified: function (a, b) {
            var k = a.getResponseHeader("Last-Modified"),
                p = a.getResponseHeader("Etag");
            if (k) e.lastModified[b] = k;
            if (p) e.etag[b] = p;
            return a.status === 304 || a.status === 0
        },
        httpData: function (a, b, k) {
            var p = a.getResponseHeader("content-type") || "",
                o = b === "xml" || !b && p.indexOf("xml") >= 0;
            a = o ? a.responseXML : a.responseText;o && a.documentElement.nodeName === "parsererror" && e.error("parsererror");
            if (k && k.dataFilter) a = k.dataFilter(a, b);
            if (typeof a === "string") if (b === "json" || !b && p.indexOf("json") >= 0) a = e.parseJSON(a);
            else if (b === "script" || !b && p.indexOf("javascript") >= 0) e.globalEval(a);
            return a
        },
        param: function (a, b) {
            function k(A, I) {
                if (e.isArray(I)) e.each(I, function (E, H) {
                    b || /\[\]$/.test(A) ? p(A, H) : k(A + "[" + (typeof H === "object" || e.isArray(H) ? E : "") + "]", H)
                });
                else!b && I != null && typeof I === "object" ? e.each(I, function (E, H) {
                    k(A + "[" + E + "]", H)
                }) : p(A, I)
            }
            function p(A, I) {
                I = e.isFunction(I) ? I() : I;o[o.length] = encodeURIComponent(A) + "=" + encodeURIComponent(I)
            }
            var o = [];
            if (b === undefined) b = e.ajaxSettings.traditional;
            if (e.isArray(a) || a.jquery) e.each(a, function () {
                p(this.name, this.value)
            });
            else for (var z in a) k(z, a[z]);
            return o.join("&").replace(yb, "+")
        }
    });
    var Ga = {},
        Ab = /toggle|show|hide/,
        Bb = /^([+-]=)?([\d+-.]+)(.*)$/,
        wa, Ja = [
            ["height", "marginTop", "marginBottom", "paddingTop", "paddingBottom"],
            ["width", "marginLeft", "marginRight", "paddingLeft", "paddingRight"],
            ["opacity"]
        ];e.fn.extend({
        show: function (a, b) {
            if (a || a === 0) return this.animate(B("show", 3), a, b);
            else {
                a = 0;
                for (b = this.length; a < b; a++) {
                    var k = e.data(this[a], "olddisplay");
                    this[a].style.display = k || "";
                    if (e.css(this[a], "display") === "none") {
                        k = this[a].nodeName;
                        var p;
                        if (Ga[k]) p = Ga[k];
                        else {
                            var o = e("<" + k + " />").appendTo("body");
                            p = o.css("display");
                            if (p === "none") p = "block";
                            o.remove();
                            Ga[k] = p
                        }
                        e.data(this[a], "olddisplay", p)
                    }
                }
                a = 0;
                for (b = this.length; a < b; a++) this[a].style.display = e.data(this[a], "olddisplay") || "";
                return this
            }
        },
        hide: function (a, b) {
            if (a || a === 0) return this.animate(B("hide", 3), a, b);
            else {
                a = 0;
                for (b = this.length; a < b; a++) {
                    var k = e.data(this[a], "olddisplay");
                    !k && k !== "none" && e.data(this[a], "olddisplay", e.css(this[a], "display"))
                }
                a = 0;
                for (b = this.length; a < b; a++) this[a].style.display = "none";
                return this
            }
        },
        _toggle: e.fn.toggle,
        toggle: function (a, b) {
            var k = typeof a === "boolean";
            if (e.isFunction(a) && e.isFunction(b)) this._toggle.apply(this, arguments);
            else a == null || k ? this.each(function () {
                var p = k ? a : e(this).is(":hidden");e(this)[p ? "show" : "hide"]()
            }) : this.animate(B("toggle", 3), a, b);
            return this
        },
        fadeTo: function (a, b, k) {
            return this.filter(":hidden").css("opacity", 0).show().end().animate({
                opacity: b
            }, a, k)
        },
        animate: function (a, b, k, p) {
            var o = e.speed(b, k, p);
            if (e.isEmptyObject(a)) return this.each(o.complete);
            return this[o.queue === false ? "each" : "queue"](function () {
                var z = e.extend({}, o),
                    A, I = this.nodeType === 1 && e(this).is(":hidden"),
                    E = this;
                for (A in a) {
                    var H =
                    A.replace(Da, Ea);
                    if (A !== H) {
                        a[H] = a[A];
                        delete a[A];
                        A = H
                    }
                    if (a[A] === "hide" && I || a[A] === "show" && !I) return z.complete.call(this);
                    if ((A === "height" || A === "width") && this.style) {
                        z.display = e.css(this, "display");
                        z.overflow = this.style.overflow
                    }
                    if (e.isArray(a[A])) {
                        (z.specialEasing = z.specialEasing || {})[A] = a[A][1];
                        a[A] = a[A][0]
                    }
                }
                if (z.overflow != null) this.style.overflow = "hidden";
                z.curAnim = e.extend({}, a);
                e.each(a, function (R, W) {
                    var ba = new e.fx(E, z, R);
                    if (Ab.test(W)) ba[W === "toggle" ? I ? "show" : "hide" : W](a);
                    else {
                        var ea = Bb.exec(W),
                            da = ba.cur(true) || 0;
                        if (ea) {
                            W = parseFloat(ea[2]);
                            var ja = ea[3] || "px";
                            if (ja !== "px") {
                                E.style[R] = (W || 1) + ja;
                                da = (W || 1) / ba.cur(true) * da;
                                E.style[R] = da + ja
                            }
                            if (ea[1]) W = (ea[1] === "-=" ? -1 : 1) * W + da;
                            ba.custom(da, W, ja)
                        } else ba.custom(da, W, "")
                    }
                });
                return true
            })
        },
        stop: function (a, b) {
            var k = e.timers;
            a && this.queue([]);
            this.each(function () {
                for (var p = k.length - 1; p >= 0; p--) if (k[p].elem === this) {
                    b && k[p](true);
                    k.splice(p, 1)
                }
            });
            b || this.dequeue();
            return this
        }
    });e.each({
        slideDown: B("show", 1),
        slideUp: B("hide", 1),
        slideToggle: B("toggle", 1),
        fadeIn: {
            opacity: "show"
        },
        fadeOut: {
            opacity: "hide"
        }
    }, function (a, b) {
        e.fn[a] = function (k, p) {
            return this.animate(b, k, p)
        }
    });e.extend({
        speed: function (a, b, k) {
            var p = a && typeof a === "object" ? a : {
                complete: k || !k && b || e.isFunction(a) && a,
                duration: a,
                easing: k && b || b && !e.isFunction(b) && b
            };p.duration = e.fx.off ? 0 : typeof p.duration === "number" ? p.duration : e.fx.speeds[p.duration] || e.fx.speeds._default;p.old = p.complete;p.complete = function () {
                p.queue !== false && e(this).dequeue();
                e.isFunction(p.old) && p.old.call(this)
            };
            return p
        },
        easing: {
            linear: function (a, b, k, p) {
                return k + p * a
            },
            swing: function (a, b, k, p) {
                return (-Math.cos(a * Math.PI) / 2 + 0.5) * p + k
            }
        },
        timers: [],
        fx: function (a, b, k) {
            this.options = b;
            this.elem = a;
            this.prop = k;
            if (!b.orig) b.orig = {}
        }
    });e.fx.prototype = {
        update: function () {
            this.options.step && this.options.step.call(this.elem, this.now, this);
            (e.fx.step[this.prop] || e.fx.step._default)(this);
            if ((this.prop === "height" || this.prop === "width") && this.elem.style) this.elem.style.display = "block"
        },
        cur: function (a) {
            if (this.elem[this.prop] != null && (!this.elem.style || this.elem.style[this.prop] == null)) return this.elem[this.prop];
            return (a = parseFloat(e.css(this.elem, this.prop, a))) && a > -10000 ? a : parseFloat(e.curCSS(this.elem, this.prop)) || 0
        },
        custom: function (a, b, k) {
            function p(z) {
                return o.step(z)
            }
            this.startTime = h();
            this.start = a;
            this.end = b;
            this.unit = k || this.unit || "px";
            this.now = this.start;
            this.pos = this.state = 0;
            var o = this;
            p.elem = this.elem;
            if (p() && e.timers.push(p) && !wa) wa = setInterval(e.fx.tick, 13)
        },
        show: function () {
            this.options.orig[this.prop] = e.style(this.elem, this.prop);
            this.options.show = true;
            this.custom(this.prop === "width" || this.prop === "height" ? 1 : 0,
            this.cur());
            e(this.elem).show()
        },
        hide: function () {
            this.options.orig[this.prop] = e.style(this.elem, this.prop);
            this.options.hide = true;
            this.custom(this.cur(), 0)
        },
        step: function (a) {
            var b = h(),
                k = true;
            if (a || b >= this.options.duration + this.startTime) {
                this.now = this.end;
                this.pos = this.state = 1;
                this.update();
                this.options.curAnim[this.prop] = true;
                for (var p in this.options.curAnim) if (this.options.curAnim[p] !== true) k = false;
                if (k) {
                    if (this.options.display != null) {
                        this.elem.style.overflow =
                        this.options.overflow;
                        a = e.data(this.elem, "olddisplay");
                        this.elem.style.display = a ? a : this.options.display;
                        if (e.css(this.elem, "display") === "none") this.elem.style.display = "block"
                    }
                    this.options.hide && e(this.elem).hide();
                    if (this.options.hide || this.options.show) for (var o in this.options.curAnim) e.style(this.elem, o, this.options.orig[o]);
                    this.options.complete.call(this.elem)
                }
                return false
            } else {
                o = b - this.startTime;
                this.state = o / this.options.duration;
                a = this.options.easing || (e.easing.swing ? "swing" : "linear");
                this.pos =
                e.easing[this.options.specialEasing && this.options.specialEasing[this.prop] || a](this.state, o, 0, 1, this.options.duration);
                this.now = this.start + (this.end - this.start) * this.pos;
                this.update()
            }
            return true
        }
    };e.extend(e.fx, {
        tick: function () {
            for (var a = e.timers, b = 0; b < a.length; b++) a[b]() || a.splice(b--, 1);
            a.length || e.fx.stop()
        },
        stop: function () {
            clearInterval(wa);
            wa = null
        },
        speeds: {
            slow: 600,
            fast: 200,
            _default: 400
        },
        step: {
            opacity: function (a) {
                e.style(a.elem, "opacity", a.now)
            },
            _default: function (a) {
                if (a.elem.style && a.elem.style[a.prop] != null) a.elem.style[a.prop] = (a.prop === "width" || a.prop === "height" ? Math.max(0, a.now) : a.now) + a.unit;
                else a.elem[a.prop] = a.now
            }
        }
    });
    if (e.expr && e.expr.filters) e.expr.filters.animated = function (a) {
        return e.grep(e.timers, function (b) {
            return a === b.elem
        }).length
    };e.fn.offset = "getBoundingClientRect" in n.documentElement ?
    function (a) {
        var b = this[0];
        if (a) return this.each(function (o) {
            e.offset.setOffset(this, a, o)
        });
        if (!b || !b.ownerDocument) return null;
        if (b === b.ownerDocument.body) return e.offset.bodyOffset(b);
        var k = b.getBoundingClientRect(),
            p = b.ownerDocument;
        b = p.body;
        p = p.documentElement;
        return {
            top: k.top + (self.pageYOffset || e.support.boxModel && p.scrollTop || b.scrollTop) - (p.clientTop || b.clientTop || 0),
            left: k.left + (self.pageXOffset || e.support.boxModel && p.scrollLeft || b.scrollLeft) - (p.clientLeft || b.clientLeft || 0)
        }
    } : function (a) {
        var b = this[0];
        if (a) return this.each(function (R) {
            e.offset.setOffset(this, a, R)
        });
        if (!b || !b.ownerDocument) return null;
        if (b === b.ownerDocument.body) return e.offset.bodyOffset(b);
        e.offset.initialize();
        var k = b.offsetParent,
            p =
            b,
            o = b.ownerDocument,
            z, A = o.documentElement,
            I = o.body;
        p = (o = o.defaultView) ? o.getComputedStyle(b, null) : b.currentStyle;
        for (var E = b.offsetTop, H = b.offsetLeft;
        (b = b.parentNode) && b !== I && b !== A;) {
            if (e.offset.supportsFixedPosition && p.position === "fixed") break;
            z = o ? o.getComputedStyle(b, null) : b.currentStyle;E -= b.scrollTop;H -= b.scrollLeft;
            if (b === k) {
                E += b.offsetTop;
                H += b.offsetLeft;
                if (e.offset.doesNotAddBorder && !(e.offset.doesAddBorderForTableAndCells && /^t(able|d|h)$/i.test(b.nodeName))) {
                    E += parseFloat(z.borderTopWidth) || 0;
                    H += parseFloat(z.borderLeftWidth) || 0
                }
                p = k;
                k = b.offsetParent
            }
            if (e.offset.subtractsBorderForOverflowNotVisible && z.overflow !== "visible") {
                E += parseFloat(z.borderTopWidth) || 0;
                H += parseFloat(z.borderLeftWidth) || 0
            }
            p = z
        }
        if (p.position === "relative" || p.position === "static") {
            E += I.offsetTop;
            H += I.offsetLeft
        }
        if (e.offset.supportsFixedPosition && p.position === "fixed") {
            E += Math.max(A.scrollTop, I.scrollTop);
            H += Math.max(A.scrollLeft, I.scrollLeft)
        }
        return {
            top: E,
            left: H
        }
    };e.offset = {
        initialize: function () {
            var a = n.body,
                b = n.createElement("div"),
                k, p, o, z = parseFloat(e.curCSS(a, "marginTop", true)) || 0;
            e.extend(b.style, {
                position: "absolute",
                top: 0,
                left: 0,
                margin: 0,
                border: 0,
                width: "1px",
                height: "1px",
                visibility: "hidden"
            });
            b.innerHTML = "<div style='position:absolute;top:0;left:0;margin:0;border:5px solid #000;padding:0;width:1px;height:1px;'><div></div></div><table style='position:absolute;top:0;left:0;margin:0;border:5px solid #000;padding:0;width:1px;height:1px;' cellpadding='0' cellspacing='0'><tr><td></td></tr></table>";
            a.insertBefore(b, a.firstChild);
            k = b.firstChild;
            p = k.firstChild;
            o = k.nextSibling.firstChild.firstChild;
            this.doesNotAddBorder = p.offsetTop !== 5;
            this.doesAddBorderForTableAndCells = o.offsetTop === 5;
            p.style.position = "fixed";
            p.style.top = "20px";
            this.supportsFixedPosition = p.offsetTop === 20 || p.offsetTop === 15;
            p.style.position = p.style.top = "";
            k.style.overflow = "hidden";
            k.style.position = "relative";
            this.subtractsBorderForOverflowNotVisible = p.offsetTop === -5;
            this.doesNotIncludeMarginInBodyOffset = a.offsetTop !== z;
            a.removeChild(b);
            e.offset.initialize = e.noop
        },
        bodyOffset: function (a) {
            var b = a.offsetTop,
                k = a.offsetLeft;
            e.offset.initialize();
            if (e.offset.doesNotIncludeMarginInBodyOffset) {
                b += parseFloat(e.curCSS(a, "marginTop", true)) || 0;
                k += parseFloat(e.curCSS(a, "marginLeft", true)) || 0
            }
            return {
                top: b,
                left: k
            }
        },
        setOffset: function (a, b, k) {
            if (/static/.test(e.curCSS(a, "position"))) a.style.position = "relative";
            var p = e(a),
                o = p.offset(),
                z = parseInt(e.curCSS(a, "top", true), 10) || 0,
                A = parseInt(e.curCSS(a, "left", true), 10) || 0;
            if (e.isFunction(b)) b = b.call(a, k, o);
            k = {
                top: b.top - o.top + z,
                left: b.left - o.left + A
            };
            "using" in b ? b.using.call(a, k) : p.css(k)
        }
    };e.fn.extend({
        position: function () {
            if (!this[0]) return null;
            var a = this[0],
                b = this.offsetParent(),
                k = this.offset(),
                p = /^body|html$/i.test(b[0].nodeName) ? {
                    top: 0,
                    left: 0
                } : b.offset();k.top -= parseFloat(e.curCSS(a, "marginTop", true)) || 0;k.left -= parseFloat(e.curCSS(a, "marginLeft", true)) || 0;p.top += parseFloat(e.curCSS(b[0], "borderTopWidth", true)) || 0;p.left += parseFloat(e.curCSS(b[0], "borderLeftWidth", true)) || 0;
            return {
                top: k.top - p.top,
                left: k.left - p.left
            }
        },
        offsetParent: function () {
            return this.map(function () {
                for (var a =
                this.offsetParent || n.body; a && !/^body|html$/i.test(a.nodeName) && e.css(a, "position") === "static";) a = a.offsetParent;
                return a
            })
        }
    });e.each(["Left", "Top"], function (a, b) {
        var k = "scroll" + b;
        e.fn[k] = function (p) {
            var o = this[0],
                z;
            if (!o) return null;
            if (p !== undefined) return this.each(function () {
                if (z = C(this)) z.scrollTo(!a ? p : e(z).scrollLeft(),
                a ? p : e(z).scrollTop());
                else this[k] = p
            });
            else return (z = C(o)) ? "pageXOffset" in z ? z[a ? "pageYOffset" : "pageXOffset"] : e.support.boxModel && z.document.documentElement[k] || z.document.body[k] : o[k]
        }
    });e.each(["Height", "Width"], function (a, b) {
        var k = b.toLowerCase();
        e.fn["inner" + b] = function () {
            return this[0] ? e.css(this[0], k, false, "padding") : null
        };
        e.fn["outer" + b] = function (p) {
            return this[0] ? e.css(this[0], k, false, p ? "margin" : "border") : null
        };
        e.fn[k] = function (p) {
            var o = this[0];
            if (!o) return p == null ? null : this;
            if (e.isFunction(p)) return this.each(function (z) {
                var A = e(this);
                A[k](p.call(this, z, A[k]()))
            });
            return "scrollTo" in o && o.document ? o.document.compatMode === "CSS1Compat" && o.document.documentElement["client" + b] || o.document.body["client" + b] : o.nodeType === 9 ? Math.max(o.documentElement["client" + b], o.body["scroll" + b], o.documentElement["scroll" + b], o.body["offset" + b], o.documentElement["offset" + b]) : p === undefined ? e.css(o, k) : this.css(k, typeof p === "string" ? p : p + "px")
        }
    });s.$ = s.jQuery = e
});
bespin.tiki.register("::embedded", {
    name: "embedded",
    dependencies: {
        theme_manager: "0.0.0",
        text_editor: "0.0.0",
        appconfig: "0.0.0",
        edit_session: "0.0.0",
        screen_theme: "0.0.0"
    }
});
bespin.tiki.module("embedded:index", function () {});
bespin.tiki.register("::settings", {
    name: "settings",
    dependencies: {
        types: "0.0.0"
    }
});
bespin.tiki.module("settings:commands", function (y, s) {
    y("bespin:plugins");
    y("environment");
    var v = y("settings").settings;
    s.setCommand = function (r, l) {
        var h;
        if (r.setting) if (r.value === undefined) h = "<strong>" + r.setting + "</strong> = " + v.get(r.setting);
        else {
            h = "Setting: <strong>" + r.setting + "</strong> = " + r.value;
            v.set(r.setting, r.value)
        } else {
            r = v._list();
            h = "";
            r.sort(function (d, f) {
                return d.key < f.key ? -1 : d.key == f.key ? 0 : 1
            });
            r.forEach(function (d) {
                h += '<a class="setting" href="https://wiki.mozilla.org/Labs/Bespin/Settings#' + d.key + '" title="View external documentation on setting: ' + d.key + '" target="_blank">' + d.key + "</a> = " + d.value + "<br/>"
            })
        }
        l.done(h)
    };
    s.unsetCommand = function (r, l) {
        v.resetValue(r.setting);
        l.done("Reset " + r.setting + " to default: " + v.get(r.setting))
    }
});
bespin.tiki.module("settings:cookie", function (y, s) {
    var v = y("bespin:util/cookie");
    s.CookiePersister = function () {};
    s.CookiePersister.prototype = {
        loadInitialValues: function (r) {
            r._loadDefaultValues().then(function () {
                var l = v.get("settings");
                r._loadFromObject(JSON.parse(l))
            }.bind(this))
        },
        persistValue: function (r) {
            try {
                var l = {};
                r._getSettingNames().forEach(function (f) {
                    l[f] = r.get(f)
                });
                var h = JSON.stringify(l);
                v.set("settings", h)
            } catch (d) {
                console.error("Unable to JSONify the settings! " + d)
            }
        }
    }
});
bespin.tiki.module("settings:index", function (y, s) {
    var v = y("bespin:plugins").catalog,
        r = y("bespin:console").console,
        l = y("bespin:promise").Promise,
        h = y("bespin:promise").group,
        d = y("types:types");
    s.addSetting = function (f) {
        y("settings").settings.addSetting(f)
    };
    s.getSettings = function () {
        return v.getExtensions("setting")
    };
    s.getTypeSpecFromAssignment = function (f) {
        var m = f.assignments;
        f = "text";
        if (m) {
            var i = null;
            m.forEach(function (g) {
                if (g.param.name === "setting") i = g
            });
            if (i) if ((m = i.value) && m !== "") if (m = v.getExtensionByKey("setting", m)) f = m.type
        }
        return f
    };
    s.MemorySettings = function () {};
    s.MemorySettings.prototype = {
        _values: {},
        _deactivated: {},
        setPersister: function (f) {
            (this._persister = f) && f.loadInitialValues(this)
        },
        get: function (f) {
            return this._values[f]
        },
        set: function (f, m) {
            var i = v.getExtensionByKey("setting", f);
            if (i) if (typeof m == "string" && i.type == "string") this._values[f] = m;
            else {
                var g = false;
                d.fromString(m, i.type).then(function (j) {
                    g = true;
                    this._values[f] = j;
                    v.publish(this, "settingChange", f, j)
                }.bind(this), function (j) {
                    r.error("Error setting", f, ": ", j)
                });
                if (!g) {
                    r.warn("About to set string version of ", f, "delaying typed set.");
                    this._values[f] = m
                }
            } else {
                r.warn("Setting not defined: ", f, m);
                this._deactivated[f] = m
            }
            this._persistValue(f, m);
            return this
        },
        addSetting: function (f) {
            if (f.name) {
                !f.defaultValue === undefined && r.error("Setting.defaultValue == undefined", f);
                d.isValid(f.defaultValue, f.type).then(function (m) {
                    m || r.warn("!Setting.isValid(Setting.defaultValue)", f);
                    this.set(f.name, this._deactivated[f.name] || f.defaultValue)
                }.bind(this), function (m) {
                    r.error("Type error ", m, " ignoring setting ", f)
                })
            } else r.error("Setting.name == undefined. Ignoring.", f)
        },
        resetValue: function (f) {
            var m = v.getExtensionByKey("setting", f);
            m ? this.set(f, m.defaultValue) : r.log("ignore resetValue on ", f)
        },
        resetAll: function () {
            this._getSettingNames().forEach(function (f) {
                this.resetValue(f)
            }.bind(this))
        },
        _getSettingNames: function () {
            var f = [];
            v.getExtensions("setting").forEach(function (m) {
                f.push(m.name)
            });
            return f
        },
        _list: function () {
            var f = [];
            this._getSettingNames().forEach(function (m) {
                f.push({
                    key: m,
                    value: this.get(m)
                })
            }.bind(this));
            return f
        },
        _persistValue: function (f, m) {
            var i = this._persister;
            i && i.persistValue(this, f, m)
        },
        _loadInitialValues: function () {
            var f = this._persister;
            f ? f.loadInitialValues(this) : this._loadDefaultValues()
        },
        _loadDefaultValues: function () {
            return this._loadFromObject(this._defaultValues())
        },
        _loadFromObject: function (f) {
            var m = [],
                i = function (B) {
                    return function (C) {
                        this.set(B, C)
                    }
                };
            for (var g in f) if (f.hasOwnProperty(g)) {
                var j = f[g],
                    q = v.getExtensionByKey("setting", g);
                if (q) {
                    j = d.fromString(j, q.type);
                    q = i(g);
                    j.then(q);
                    m.push(j)
                }
            }
            var t = new l;
            h(m).then(function () {
                t.resolve()
            });
            return t
        },
        _saveToObject: function () {
            var f = [],
                m = {};
            this._getSettingNames().forEach(function (g) {
                var j = this.get(g),
                    q = v.getExtensionByKey("setting", g);
                if (q) {
                    j = d.toString(j, q.type);
                    j.then(function (t) {
                        m[g] = t
                    });
                    f.push(j)
                }
            }.bind(this));
            var i = new l;
            h(f).then(function () {
                i.resolve(m)
            });
            return i
        },
        _defaultValues: function () {
            var f = {};
            v.getExtensions("setting").forEach(function (m) {
                f[m.name] = m.defaultValue
            });
            return f
        }
    };
    s.settings = new s.MemorySettings
});
bespin.tiki.register("::appconfig", {
    name: "appconfig",
    dependencies: {
        jquery: "0.0.0",
        canon: "0.0.0",
        settings: "0.0.0"
    }
});
bespin.tiki.module("appconfig:index", function (y, s) {
    var v = y("jquery").$,
        r = y("settings").settings,
        l = y("bespin:promise").group,
        h = y("bespin:promise").Promise,
        d = y("bespin:console").console,
        f = y("bespin:util/stacktrace").Trace,
        m = y("bespin:util/util"),
        i = true;
    s.launch = function (q) {
        var t = new h;
        v("#_bespin_loading").remove();
        var B;
        if (i) {
            B = bespin.tiki.require;
            i = false
        } else B = (new(bespin.tiki.require("bespin:sandbox").Sandbox)).createRequire({
            id: "index",
            ownerPackage: bespin.tiki.loader.anonymousPackage
        });
        var C =
        B("bespin:plugins").catalog;
        q = q || {};
        s.normalizeConfig(C, q);
        var e = q.objects;
        for (var K in e) C.registerObject(K, e[K]);
        for (var L in q.settings) r.set(L, q.settings[L]);
        var n = function () {
            var D = B("environment").env,
                J = D.editor;
            if (J) {
                q.lineNumber && J.setLineNumber(q.lineNumber);
                if (q.stealFocus) J.focus = true;
                if (q.readOnly) J.readOnly = q.readOnly;
                if (q.syntax) J.syntax = q.syntax
            }
            if (J = C.getObject("commandLine")) D.commandLine = J;
            C.publish(this, "appLaunched");
            t.resolve(D)
        }.bind(this),
            w = new h;
        w.then(function () {
            e.loginController ? C.createObject("loginController").then(function (D) {
                D.showLogin().then(function (J) {
                    q.objects.session.arguments.push(J);
                    s.launchEditor(C, q).then(n, t.reject.bind(t))
                })
            }) : s.launchEditor(C, q).then(n, t.reject.bind(t))
        }, function (D) {
            t.reject(D)
        });
        C.plugins.theme_manager ? bespin.tiki.require.ensurePackage("::theme_manager", function () {
            var D = B("theme_manager");
            q.theme.basePlugin && D.setBasePlugin(q.theme.basePlugin);
            q.theme.standard && D.setStandardTheme(q.theme.standard);
            D.startParsing().then(function () {
                w.resolve()
            }, function (J) {
                w.reject(J)
            })
        }) : w.resolve();
        return t
    };
    s.normalizeConfig = function (q, t) {
        if (t.objects === undefined) t.objects = {};
        if (t.autoload === undefined) t.autoload = [];
        if (t.theme === undefined) t.theme = {};
        if (!t.theme.basePlugin && q.plugins.screen_theme) t.theme.basePlugin = "screen_theme";
        if (!t.initialContent) t.initialContent = "";
        if (!t.settings) t.settings = {};
        if (!t.objects.notifier && q.plugins.notifier) t.objects.notifier = {};
        if (!t.objects.loginController && q.plugins.userident) t.objects.loginController = {};
        if (!t.objects.fileHistory && q.plugins.file_history) t.objects.fileHistory = {
            factory: "file_history",
            arguments: ["session"],
            objects: {
                "0": "session"
            }
        };
        if (!t.objects.server && q.plugins.bespin_server) {
            t.objects.server = {
                factory: "bespin_server"
            };
            t.objects.filesource = {
                factory: "bespin_filesource",
                arguments: ["server"],
                objects: {
                    "0": "server"
                }
            }
        }
        if (!t.objects.files && q.plugins.filesystem && t.objects.filesource) t.objects.files = {
            arguments: ["filesource"],
            objects: {
                "0": "filesource"
            }
        };
        if (!t.objects.editor) t.objects.editor = {
            factory: "text_editor",
            arguments: [t.initialContent]
        };
        if (!t.objects.session) t.objects.session = {
            arguments: ["editor"],
            objects: {
                "0": "editor"
            }
        };
        if (!t.objects.commandLine && q.plugins.command_line) t.objects.commandLine = {};
        if (t.gui === undefined) t.gui = {};
        q = {};
        for (var B in t.gui) {
            var C = t.gui[B];
            if (C.component) q[C.component] = true
        }
        if (!t.gui.center && t.objects.editor && !q.editor) t.gui.center = {
            component: "editor"
        };
        if (!t.gui.south && t.objects.commandLine && !q.commandLine) t.gui.south = {
            component: "commandLine"
        }
    };
    s.launchEditor = function (q, t) {
        var B = new h;
        if (t === null) {
            d.error("Cannot start editor without a configuration!");
            B.reject("Cannot start editor without a configuration!");
            return B
        }
        g(q, t).then(function () {
            j(q, t, B)
        }, function (C) {
            d.error("Error while creating objects");
            (new f(C)).log();
            B.reject(C)
        });
        return B
    };
    var g = function (q, t) {
        var B = [];
        for (var C in t.objects) B.push(q.createObject(C));
        return l(B)
    },
        j = function (q, t, B) {
            var C = document.createElement("div");
            C.setAttribute("class", "container");
            var e = document.createElement("div");
            e.setAttribute("class", "center-container");
            C.appendChild(e);
            var K = t.element || document.body;
            m.addClass(K, "bespin");
            K.appendChild(C);
            for (var L in t.gui) {
                var n = t.gui[L],
                    w = q.getObject(n.component);
                if (!w) {
                    q = "Cannot find object " + n.component + " to attach to the Bespin UI";
                    d.error(q);
                    B.reject(q);
                    return
                }
                K = w.element;
                if (!K) {
                    q = "Component " + n.component + ' does not have an "element" attribute to attach to the Bespin UI';
                    d.error(q);
                    B.reject(q);
                    return
                }
                v(K).addClass(L);
                L == "west" || L == "east" || L == "center" ? e.appendChild(K) : C.appendChild(K);w.elementAppended && w.elementAppended()
            }
            B.resolve()
        }
});
bespin.tiki.register("::events", {
    name: "events",
    dependencies: {
        traits: "0.0.0"
    }
});
bespin.tiki.module("events:index", function (y, s) {
    s.Event = function () {
        var v = [],
            r = function () {
                var l = arguments;
                v.forEach(function (h) {
                    h.func.apply(null, l)
                })
            };
        r.add = function () {
            arguments.length == 1 ? v.push({
                ref: arguments[0],
                func: arguments[0]
            }) : v.push({
                ref: arguments[0],
                func: arguments[1]
            })
        };
        r.remove = function (l) {
            v = v.filter(function (h) {
                return l !== h.ref
            })
        };
        r.removeAll = function () {
            v = []
        };
        return r
    }
});
bespin.tiki.register("::screen_theme", {
    name: "screen_theme",
    dependencies: {
        theme_manager: "0.0.0"
    }
});
bespin.tiki.module("screen_theme:index", function () {});
(function () {
    var y = bespin.tiki.require("jquery").$;
    y(document).ready(function () {
        bespin.tiki.require("bespin:plugins").catalog.registerMetadata({
            text_editor: {
                resourceURL: "resources/text_editor/",
                description: "Canvas-based text editor component and many common editing commands",
                dependencies: {
                    completion: "0.0.0",
                    undomanager: "0.0.0",
                    settings: "0.0.0",
                    canon: "0.0.0",
                    rangeutils: "0.0.0",
                    traits: "0.0.0",
                    theme_manager: "0.0.0",
                    keyboard: "0.0.0",
                    edit_session: "0.0.0",
                    syntax_manager: "0.0.0"
                },
                testmodules: ["tests/controllers/testLayoutmanager", "tests/models/testTextstorage", "tests/testScratchcanvas", "tests/utils/testRect"],
                provides: [{
                    action: "new",
                    pointer: "views/editor#EditorView",
                    ep: "factory",
                    name: "text_editor"
                },
                {
                    pointer: "views/editor#EditorView",
                    ep: "appcomponent",
                    name: "editor_view"
                },
                {
                    predicates: {
                        isTextView: true
                    },
                    pointer: "commands/editing#backspace",
                    ep: "command",
                    key: "backspace",
                    name: "backspace"
                },
                {
                    predicates: {
                        isTextView: true
                    },
                    pointer: "commands/editing#deleteCommand",
                    ep: "command",
                    key: "delete",
                    name: "delete"
                },
                {
                    description: "Delete all lines currently selected",
                    key: "ctrl_d",
                    predicates: {
                        isTextView: true
                    },
                    pointer: "commands/editing#deleteLines",
                    ep: "command",
                    name: "deletelines"
                },
                {
                    description: "Create a new, empty line below the current one",
                    key: "ctrl_return",
                    predicates: {
                        isTextView: true
                    },
                    pointer: "commands/editing#openLine",
                    ep: "command",
                    name: "openline"
                },
                {
                    description: "Join the current line with the following",
                    key: "ctrl_shift_j",
                    predicates: {
                        isTextView: true
                    },
                    pointer: "commands/editing#joinLines",
                    ep: "command",
                    name: "joinline"
                },
                {
                    params: [{
                        defaultValue: "",
                        type: "text",
                        name: "text",
                        description: "The text to insert"
                    }],
                    pointer: "commands/editing#insertText",
                    ep: "command",
                    name: "insertText"
                },
                {
                    predicates: {
                        completing: false,
                        isTextView: true
                    },
                    pointer: "commands/editing#newline",
                    ep: "command",
                    key: "return",
                    name: "newline"
                },
                {
                    predicates: {
                        completing: false,
                        isTextView: true
                    },
                    pointer: "commands/editing#tab",
                    ep: "command",
                    key: "tab",
                    name: "tab"
                },
                {
                    predicates: {
                        isTextView: true
                    },
                    pointer: "commands/editing#untab",
                    ep: "command",
                    key: "shift_tab",
                    name: "untab"
                },
                {
                    predicates: {
                        isTextView: true
                    },
                    ep: "command",
                    name: "move"
                },
                {
                    description: "Repeat the last search (forward)",
                    pointer: "commands/editor#findNextCommand",
                    ep: "command",
                    key: "ctrl_g",
                    name: "findnext"
                },
                {
                    description: "Repeat the last search (backward)",
                    pointer: "commands/editor#findPrevCommand",
                    ep: "command",
                    key: "ctrl_shift_g",
                    name: "findprev"
                },
                {
                    predicates: {
                        completing: false,
                        isTextView: true
                    },
                    pointer: "commands/movement#moveDown",
                    ep: "command",
                    key: "down",
                    name: "move down"
                },
                {
                    predicates: {
                        isTextView: true
                    },
                    pointer: "commands/movement#moveLeft",
                    ep: "command",
                    key: "left",
                    name: "move left"
                },
                {
                    predicates: {
                        isTextView: true
                    },
                    pointer: "commands/movement#moveRight",
                    ep: "command",
                    key: "right",
                    name: "move right"
                },
                {
                    predicates: {
                        completing: false,
                        isTextView: true
                    },
                    pointer: "commands/movement#moveUp",
                    ep: "command",
                    key: "up",
                    name: "move up"
                },
                {
                    predicates: {
                        isTextView: true
                    },
                    ep: "command",
                    name: "select"
                },
                {
                    predicates: {
                        isTextView: true
                    },
                    pointer: "commands/movement#selectDown",
                    ep: "command",
                    key: "shift_down",
                    name: "select down"
                },
                {
                    predicates: {
                        isTextView: true
                    },
                    pointer: "commands/movement#selectLeft",
                    ep: "command",
                    key: "shift_left",
                    name: "select left"
                },
                {
                    predicates: {
                        isTextView: true
                    },
                    pointer: "commands/movement#selectRight",
                    ep: "command",
                    key: "shift_right",
                    name: "select right"
                },
                {
                    predicates: {
                        isTextView: true
                    },
                    pointer: "commands/movement#selectUp",
                    ep: "command",
                    key: "shift_up",
                    name: "select up"
                },
                {
                    predicates: {
                        isTextView: true
                    },
                    pointer: "commands/movement#moveLineEnd",
                    ep: "command",
                    key: ["end", "ctrl_right"],
                    name: "move lineend"
                },
                {
                    predicates: {
                        isTextView: true
                    },
                    pointer: "commands/movement#selectLineEnd",
                    ep: "command",
                    key: ["shift_end", "ctrl_shift_right"],
                    name: "select lineend"
                },
                {
                    predicates: {
                        isTextView: true
                    },
                    pointer: "commands/movement#moveDocEnd",
                    ep: "command",
                    key: "ctrl_down",
                    name: "move docend"
                },
                {
                    predicates: {
                        isTextView: true
                    },
                    pointer: "commands/movement#selectDocEnd",
                    ep: "command",
                    key: "ctrl_shift_down",
                    name: "select docend"
                },
                {
                    predicates: {
                        isTextView: true
                    },
                    pointer: "commands/movement#moveLineStart",
                    ep: "command",
                    key: ["home", "ctrl_left"],
                    name: "move linestart"
                },
                {
                    predicates: {
                        isTextView: true
                    },
                    pointer: "commands/movement#selectLineStart",
                    ep: "command",
                    key: ["shift_home", "ctrl_shift_left"],
                    name: "select linestart"
                },
                {
                    predicates: {
                        isTextView: true
                    },
                    pointer: "commands/movement#moveDocStart",
                    ep: "command",
                    key: "ctrl_up",
                    name: "move docstart"
                },
                {
                    predicates: {
                        isTextView: true
                    },
                    pointer: "commands/movement#selectDocStart",
                    ep: "command",
                    key: "ctrl_shift_up",
                    name: "select docstart"
                },
                {
                    predicates: {
                        isTextView: true
                    },
                    pointer: "commands/movement#moveNextWord",
                    ep: "command",
                    key: ["alt_right"],
                    name: "move nextword"
                },
                {
                    predicates: {
                        isTextView: true
                    },
                    pointer: "commands/movement#selectNextWord",
                    ep: "command",
                    key: ["alt_shift_right"],
                    name: "select nextword"
                },
                {
                    predicates: {
                        isTextView: true
                    },
                    pointer: "commands/movement#movePreviousWord",
                    ep: "command",
                    key: ["alt_left"],
                    name: "move prevword"
                },
                {
                    predicates: {
                        isTextView: true
                    },
                    pointer: "commands/movement#selectPreviousWord",
                    ep: "command",
                    key: ["alt_shift_left"],
                    name: "select prevword"
                },
                {
                    predicates: {
                        isTextView: true
                    },
                    pointer: "commands/movement#selectAll",
                    ep: "command",
                    key: ["ctrl_a", "meta_a"],
                    name: "select all"
                },
                {
                    predicates: {
                        isTextView: true
                    },
                    ep: "command",
                    name: "scroll"
                },
                {
                    predicates: {
                        isTextView: true
                    },
                    pointer: "commands/scrolling#scrollDocStart",
                    ep: "command",
                    key: "ctrl_home",
                    name: "scroll start"
                },
                {
                    predicates: {
                        isTextView: true
                    },
                    pointer: "commands/scrolling#scrollDocEnd",
                    ep: "command",
                    key: "ctrl_end",
                    name: "scroll end"
                },
                {
                    predicates: {
                        isTextView: true
                    },
                    pointer: "commands/scrolling#scrollPageDown",
                    ep: "command",
                    key: "pagedown",
                    name: "scroll down"
                },
                {
                    predicates: {
                        isTextView: true
                    },
                    pointer: "commands/scrolling#scrollPageUp",
                    ep: "command",
                    key: "pageup",
                    name: "scroll up"
                },
                {
                    pointer: "commands/editor#lcCommand",
                    description: "Change all selected text to lowercase",
                    withKey: "CMD SHIFT L",
                    ep: "command",
                    name: "lc"
                },
                {
                    pointer: "commands/editor#detabCommand",
                    description: "Convert tabs to spaces.",
                    params: [{
                        defaultValue: null,
                        type: "text",
                        name: "tabsize",
                        description: "Optionally, specify a tab size. (Defaults to setting.)"
                    }],
                    ep: "command",
                    name: "detab"
                },
                {
                    pointer: "commands/editor#entabCommand",
                    description: "Convert spaces to tabs.",
                    params: [{
                        defaultValue: null,
                        type: "text",
                        name: "tabsize",
                        description: "Optionally, specify a tab size. (Defaults to setting.)"
                    }],
                    ep: "command",
                    name: "entab"
                },
                {
                    pointer: "commands/editor#trimCommand",
                    description: "trim trailing or leading whitespace from each line in selection",
                    params: [{
                        defaultValue: "both",
                        type: {
                            data: [{
                                name: "left"
                            },
                            {
                                name: "right"
                            },
                            {
                                name: "both"
                            }],
                            name: "selection"
                        },
                        name: "side",
                        description: "Do we trim from the left, right or both"
                    }],
                    ep: "command",
                    name: "trim"
                },
                {
                    pointer: "commands/editor#ucCommand",
                    description: "Change all selected text to uppercase",
                    withKey: "CMD SHIFT U",
                    ep: "command",
                    name: "uc"
                },
                {
                    predicates: {
                        isTextView: true
                    },
                    pointer: "controllers/undo#undoManagerCommand",
                    ep: "command",
                    key: ["ctrl_shift_z"],
                    name: "redo"
                },
                {
                    predicates: {
                        isTextView: true
                    },
                    pointer: "controllers/undo#undoManagerCommand",
                    ep: "command",
                    key: ["ctrl_z"],
                    name: "undo"
                },
                {
                    description: "The distance in characters between each tab",
                    defaultValue: 8,
                    type: "number",
                    ep: "setting",
                    name: "tabstop"
                },
                {
                    description: "Customize the keymapping",
                    defaultValue: "{}",
                    type: "text",
                    ep: "setting",
                    name: "customKeymapping"
                },
                {
                    description: "The keymapping to use",
                    defaultValue: "standard",
                    type: "text",
                    ep: "setting",
                    name: "keymapping"
                },
                {
                    description: "The editor font size in pixels",
                    defaultValue: 14,
                    type: "number",
                    ep: "setting",
                    name: "fontsize"
                },
                {
                    description: "The editor font face",
                    defaultValue: "Monaco, Lucida Console, monospace",
                    type: "text",
                    ep: "setting",
                    name: "fontface"
                },
                {
                    defaultValue: {
                        color: "#e5c138",
                        paddingLeft: 5,
                        backgroundColor: "#4c4a41",
                        paddingRight: 10
                    },
                    ep: "themevariable",
                    name: "gutter"
                },
                {
                    defaultValue: {
                        color: "#e6e6e6",
                        selectedTextBackgroundColor: "#526da5",
                        backgroundColor: "#2a211c",
                        cursorColor: "#879aff",
                        unfocusedCursorBackgroundColor: "#73171e",
                        unfocusedCursorColor: "#ff0033"
                    },
                    ep: "themevariable",
                    name: "editor"
                },
                {
                    defaultValue: {
                        comment: "#666666",
                        directive: "#999999",
                        keyword: "#42A8ED",
                        plain: "#e6e6e6",
                        error: "#ff0000",
                        operator: "#88BBFF",
                        identifier: "#D841FF",
                        string: "#039A0A"
                    },
                    ep: "themevariable",
                    name: "highlighter"
                },
                {
                    defaultValue: {
                        nibStrokeStyle: "rgb(150, 150, 150)",
                        fullAlpha: 1,
                        barFillStyle: "rgb(0, 0, 0)",
                        particalAlpha: 0.3,
                        barFillGradientBottomStop: "rgb(44, 44, 44)",
                        backgroundStyle: "#2A211C",
                        thickness: 17,
                        padding: 5,
                        trackStrokeStyle: "rgb(150, 150, 150)",
                        nibArrowStyle: "rgb(255, 255, 255)",
                        barFillGradientBottomStart: "rgb(22, 22, 22)",
                        barFillGradientTopStop: "rgb(40, 40, 40)",
                        barFillGradientTopStart: "rgb(90, 90, 90)",
                        nibStyle: "rgb(100, 100, 100)",
                        trackFillStyle: "rgba(50, 50, 50, 0.8)"
                    },
                    ep: "themevariable",
                    name: "scroller"
                },
                {
                    description: "Event: Notify when something within the editor changed.",
                    params: [{
                        required: true,
                        name: "pointer",
                        description: "Function that is called whenever a change happened."
                    }],
                    ep: "extensionpoint",
                    name: "editorChange"
                }],
                type: "plugins/supported",
                name: "text_editor"
            },
            less: {
                resourceURL: "resources/less/",
                description: "Leaner CSS",
                contributors: [],
                author: "Alexis Sellier <self@cloudhead.net>",
                url: "http://lesscss.org",
                version: "1.0.11",
                dependencies: {},
                testmodules: [],
                provides: [],
                keywords: ["css", "parser", "lesscss", "browser"],
                type: "plugins/thirdparty",
                name: "less"
            },
            theme_manager_base: {
                resourceURL: "resources/theme_manager_base/",
                name: "theme_manager_base",
                share: true,
                environments: {
                    main: true
                },
                dependencies: {},
                testmodules: [],
                provides: [{
                    description: "(Less)files holding the CSS style information for the UI.",
                    params: [{
                        required: true,
                        name: "url",
                        description: "Name of the ThemeStylesFile - can also be an array of files."
                    }],
                    ep: "extensionpoint",
                    name: "themestyles"
                },
                {
                    description: "Event: Notify when the theme(styles) changed.",
                    params: [{
                        required: true,
                        name: "pointer",
                        description: "Function that is called whenever the theme is changed."
                    }],
                    ep: "extensionpoint",
                    name: "themeChange"
                },
                {
                    indexOn: "name",
                    description: "A theme is a way change the look of the application.",
                    params: [{
                        required: false,
                        name: "url",
                        description: "Name of a ThemeStylesFile that holds theme specific CSS rules - can also be an array of files."
                    },
                    {
                        required: true,
                        name: "pointer",
                        description: "Function that returns the ThemeData"
                    }],
                    ep: "extensionpoint",
                    name: "theme"
                }],
                type: "plugins/supported",
                description: "Defines extension points required for theming"
            },
            canon: {
                resourceURL: "resources/canon/",
                name: "canon",
                environments: {
                    main: true,
                    worker: false
                },
                dependencies: {
                    environment: "0.0.0",
                    events: "0.0.0",
                    settings: "0.0.0"
                },
                testmodules: [],
                provides: [{
                    indexOn: "name",
                    description: "A command is a bit of functionality with optional typed arguments which can do something small like moving the cursor around the screen, or large like cloning a project from VCS.",
                    ep: "extensionpoint",
                    name: "command"
                },
                {
                    description: "An extension point to be called whenever a new command begins output.",
                    ep: "extensionpoint",
                    name: "addedRequestOutput"
                },
                {
                    description: "A dimensionsChanged is a way to be notified of changes to the dimension of Bespin",
                    ep: "extensionpoint",
                    name: "dimensionsChanged"
                },
                {
                    description: "How many typed commands do we recall for reference?",
                    defaultValue: 50,
                    type: "number",
                    ep: "setting",
                    name: "historyLength"
                },
                {
                    action: "create",
                    pointer: "history#InMemoryHistory",
                    ep: "factory",
                    name: "history"
                }],
                type: "plugins/supported",
                description: "Manages commands"
            },
            traits: {
                resourceURL: "resources/traits/",
                description: "Traits library, traitsjs.org",
                dependencies: {},
                testmodules: [],
                provides: [],
                type: "plugins/thirdparty",
                name: "traits"
            },
            keyboard: {
                resourceURL: "resources/keyboard/",
                description: "Keyboard shortcuts",
                dependencies: {
                    canon: "0.0",
                    settings: "0.0"
                },
                testmodules: ["tests/testKeyboard"],
                provides: [{
                    description: "A keymapping defines how keystrokes are interpreted.",
                    params: [{
                        required: true,
                        name: "states",
                        description: "Holds the states and all the informations about the keymapping. See docs: pluginguide/keymapping"
                    }],
                    ep: "extensionpoint",
                    name: "keymapping"
                }],
                type: "plugins/supported",
                name: "keyboard"
            },
            worker_manager: {
                resourceURL: "resources/worker_manager/",
                description: "Manages a web worker on the browser side",
                dependencies: {
                    canon: "0.0.0",
                    events: "0.0.0",
                    underscore: "0.0.0"
                },
                testmodules: [],
                provides: [{
                    description: "Low-level web worker control (for plugin development)",
                    ep: "command",
                    name: "worker"
                },
                {
                    description: "Restarts all web workers (for plugin development)",
                    pointer: "#workerRestartCommand",
                    ep: "command",
                    name: "worker restart"
                }],
                type: "plugins/supported",
                name: "worker_manager"
            },
            edit_session: {
                resourceURL: "resources/edit_session/",
                description: "Ties together the files being edited with the views on screen",
                dependencies: {
                    events: "0.0.0"
                },
                testmodules: ["tests/testSession"],
                provides: [{
                    action: "call",
                    pointer: "#createSession",
                    ep: "factory",
                    name: "session"
                }],
                type: "plugins/supported",
                name: "edit_session"
            },
            syntax_manager: {
                resourceURL: "resources/syntax_manager/",
                name: "syntax_manager",
                environments: {
                    main: true,
                    worker: false
                },
                dependencies: {
                    worker_manager: "0.0.0",
                    events: "0.0.0",
                    underscore: "0.0.0",
                    syntax_directory: "0.0.0"
                },
                testmodules: [],
                provides: [],
                type: "plugins/supported",
                description: "Provides syntax highlighting services for the editor"
            },
            completion: {
                resourceURL: "resources/completion/",
                description: "Code completion support",
                dependencies: {
                    jquery: "0.0.0",
                    ctags: "0.0.0",
                    rangeutils: "0.0.0",
                    canon: "0.0.0",
                    underscore: "0.0.0"
                },
                testmodules: [],
                provides: [{
                    indexOn: "name",
                    description: "Code completion support for specific languages",
                    ep: "extensionpoint",
                    name: "completion"
                },
                {
                    description: "Accept the chosen completion",
                    key: ["return", "tab"],
                    predicates: {
                        completing: true
                    },
                    pointer: "controller#completeCommand",
                    ep: "command",
                    name: "complete"
                },
                {
                    description: "Abandon the completion",
                    key: "escape",
                    predicates: {
                        completing: true
                    },
                    pointer: "controller#completeCancelCommand",
                    ep: "command",
                    name: "complete cancel"
                },
                {
                    description: "Choose the completion below",
                    key: "down",
                    predicates: {
                        completing: true
                    },
                    pointer: "controller#completeDownCommand",
                    ep: "command",
                    name: "complete down"
                },
                {
                    description: "Choose the completion above",
                    key: "up",
                    predicates: {
                        completing: true
                    },
                    pointer: "controller#completeUpCommand",
                    ep: "command",
                    name: "complete up"
                }],
                type: "plugins/supported",
                name: "completion"
            },
            environment: {
                testmodules: [],
                dependencies: {
                    settings: "0.0.0"
                },
                resourceURL: "resources/environment/",
                name: "environment",
                type: "plugins/supported"
            },
            undomanager: {
                resourceURL: "resources/undomanager/",
                description: "Manages undoable events",
                testmodules: ["tests/testUndomanager"],
                provides: [{
                    pointer: "#undoManagerCommand",
                    ep: "command",
                    key: ["ctrl_shift_z"],
                    name: "redo"
                },
                {
                    pointer: "#undoManagerCommand",
                    ep: "command",
                    key: ["ctrl_z"],
                    name: "undo"
                }],
                type: "plugins/supported",
                name: "undomanager"
            },
            rangeutils: {
                testmodules: ["tests/test"],
                type: "plugins/supported",
                resourceURL: "resources/rangeutils/",
                description: "Utility functions for dealing with ranges of text",
                name: "rangeutils"
            },
            stylesheet: {
                resourceURL: "resources/stylesheet/",
                name: "stylesheet",
                environments: {
                    worker: true
                },
                dependencies: {
                    standard_syntax: "0.0.0"
                },
                testmodules: [],
                provides: [{
                    pointer: "#CSSSyntax",
                    ep: "syntax",
                    fileexts: ["css", "less"],
                    name: "css"
                }],
                type: "plugins/supported",
                description: "CSS syntax highlighter"
            },
            html: {
                resourceURL: "resources/html/",
                name: "html",
                environments: {
                    worker: true
                },
                dependencies: {
                    standard_syntax: "0.0.0"
                },
                testmodules: [],
                provides: [{
                    pointer: "#HTMLSyntax",
                    ep: "syntax",
                    fileexts: ["htm", "html"],
                    name: "html"
                }],
                type: "plugins/supported",
                description: "HTML syntax highlighter"
            },
            js_syntax: {
                resourceURL: "resources/js_syntax/",
                name: "js_syntax",
                environments: {
                    worker: true
                },
                dependencies: {
                    standard_syntax: "0.0.0"
                },
                testmodules: [],
                provides: [{
                    pointer: "#JSSyntax",
                    ep: "syntax",
                    fileexts: ["js", "json"],
                    name: "js"
                }],
                type: "plugins/supported",
                description: "JavaScript syntax highlighter"
            },
            ctags: {
                resourceURL: "resources/ctags/",
                description: "Reads and writes tag files",
                dependencies: {
                    traits: "0.0.0",
                    underscore: "0.0.0"
                },
                testmodules: [],
                type: "plugins/supported",
                name: "ctags"
            },
            events: {
                resourceURL: "resources/events/",
                description: "Dead simple event implementation",
                dependencies: {
                    traits: "0.0"
                },
                testmodules: ["tests/test"],
                provides: [],
                type: "plugins/supported",
                name: "events"
            },
            theme_manager: {
                resourceURL: "resources/theme_manager/",
                name: "theme_manager",
                share: true,
                environments: {
                    main: true,
                    worker: false
                },
                dependencies: {
                    theme_manager_base: "0.0.0",
                    settings: "0.0.0",
                    events: "0.0.0",
                    less: "0.0.0"
                },
                testmodules: [],
                provides: [{
                    unregister: "themestyles#unregisterThemeStyles",
                    register: "themestyles#registerThemeStyles",
                    ep: "extensionhandler",
                    name: "themestyles"
                },
                {
                    unregister: "index#unregisterTheme",
                    register: "index#registerTheme",
                    ep: "extensionhandler",
                    name: "theme"
                },
                {
                    defaultValue: "standard",
                    description: "The theme plugin's name to use. If set to 'standard' no theme will be used",
                    type: "text",
                    ep: "setting",
                    name: "theme"
                },
                {
                    pointer: "#appLaunched",
                    ep: "appLaunched"
                }],
                type: "plugins/supported",
                description: "Handles colors in Bespin"
            },
            standard_syntax: {
                resourceURL: "resources/standard_syntax/",
                description: "Easy-to-use basis for syntax engines",
                environments: {
                    worker: true
                },
                dependencies: {
                    syntax_worker: "0.0.0",
                    syntax_directory: "0.0.0",
                    underscore: "0.0.0"
                },
                testmodules: [],
                type: "plugins/supported",
                name: "standard_syntax"
            },
            types: {
                resourceURL: "resources/types/",
                description: "Defines parameter types for commands",
                testmodules: ["tests/testBasic", "tests/testTypes"],
                provides: [{
                    indexOn: "name",
                    description: "Commands can accept various arguments that the user enters or that are automatically supplied by the environment. Those arguments have types that define how they are supplied or completed. The pointer points to an object with methods convert(str value) and getDefault(). Both functions have `this` set to the command's `takes` parameter. If getDefault is not defined, the default on the command's `takes` is used, if there is one. The object can have a noInput property that is set to true to reflect that this type is provided directly by the system. getDefault must be defined in that case.",
                    ep: "extensionpoint",
                    name: "type"
                },
                {
                    description: "Text that the user needs to enter.",
                    pointer: "basic#text",
                    ep: "type",
                    name: "text"
                },
                {
                    description: "A JavaScript number",
                    pointer: "basic#number",
                    ep: "type",
                    name: "number"
                },
                {
                    description: "A true/false value",
                    pointer: "basic#bool",
                    ep: "type",
                    name: "boolean"
                },
                {
                    description: "An object that converts via JavaScript",
                    pointer: "basic#object",
                    ep: "type",
                    name: "object"
                },
                {
                    description: "A string that is constrained to be one of a number of pre-defined values",
                    pointer: "basic#selection",
                    ep: "type",
                    name: "selection"
                },
                {
                    description: "A type which we don't understand from the outset, but which we hope context can help us with",
                    ep: "type",
                    name: "deferred"
                }],
                type: "plugins/supported",
                name: "types"
            },
            jquery: {
                testmodules: [],
                resourceURL: "resources/jquery/",
                name: "jquery",
                type: "plugins/thirdparty"
            },
            embedded: {
                testmodules: [],
                dependencies: {
                    theme_manager: "0.0.0",
                    text_editor: "0.0.0",
                    appconfig: "0.0.0",
                    edit_session: "0.0.0",
                    screen_theme: "0.0.0"
                },
                resourceURL: "resources/embedded/",
                name: "embedded",
                type: "plugins/supported"
            },
            settings: {
                resourceURL: "resources/settings/",
                description: "Infrastructure and commands for managing user preferences",
                share: true,
                dependencies: {
                    types: "0.0"
                },
                testmodules: [],
                provides: [{
                    description: "Storage for the customizable Bespin settings",
                    pointer: "index#settings",
                    ep: "appcomponent",
                    name: "settings"
                },
                {
                    indexOn: "name",
                    description: "A setting is something that the application offers as a way to customize how it works",
                    register: "index#addSetting",
                    ep: "extensionpoint",
                    name: "setting"
                },
                {
                    description: "A settingChange is a way to be notified of changes to a setting",
                    ep: "extensionpoint",
                    name: "settingChange"
                },
                {
                    pointer: "commands#setCommand",
                    description: "define and show settings",
                    params: [{
                        defaultValue: null,
                        type: {
                            pointer: "settings:index#getSettings",
                            name: "selection"
                        },
                        name: "setting",
                        description: "The name of the setting to display or alter"
                    },
                    {
                        defaultValue: null,
                        type: {
                            pointer: "settings:index#getTypeSpecFromAssignment",
                            name: "deferred"
                        },
                        name: "value",
                        description: "The new value for the chosen setting"
                    }],
                    ep: "command",
                    name: "set"
                },
                {
                    pointer: "commands#unsetCommand",
                    description: "unset a setting entirely",
                    params: [{
                        type: {
                            pointer: "settings:index#getSettings",
                            name: "selection"
                        },
                        name: "setting",
                        description: "The name of the setting to return to defaults"
                    }],
                    ep: "command",
                    name: "unset"
                }],
                type: "plugins/supported",
                name: "settings"
            },
            appconfig: {
                resourceURL: "resources/appconfig/",
                description: "Instantiates components and displays the GUI based on configuration.",
                dependencies: {
                    jquery: "0.0.0",
                    canon: "0.0.0",
                    settings: "0.0.0"
                },
                testmodules: [],
                provides: [{
                    description: "Event: Fired when the app is completely launched.",
                    ep: "extensionpoint",
                    name: "appLaunched"
                }],
                type: "plugins/supported",
                name: "appconfig"
            },
            syntax_worker: {
                resourceURL: "resources/syntax_worker/",
                description: "Coordinates multiple syntax engines",
                environments: {
                    worker: true
                },
                dependencies: {
                    syntax_directory: "0.0.0",
                    underscore: "0.0.0"
                },
                testmodules: [],
                type: "plugins/supported",
                name: "syntax_worker"
            },
            screen_theme: {
                resourceURL: "resources/screen_theme/",
                description: "Bespins standard theme basePlugin",
                dependencies: {
                    theme_manager: "0.0.0"
                },
                testmodules: [],
                provides: [{
                    url: ["theme.less"],
                    ep: "themestyles"
                },
                {
                    defaultValue: "@global_font",
                    ep: "themevariable",
                    name: "container_font"
                },
                {
                    defaultValue: "@global_font_size",
                    ep: "themevariable",
                    name: "container_font_size"
                },
                {
                    defaultValue: "@global_container_background",
                    ep: "themevariable",
                    name: "container_bg"
                },
                {
                    defaultValue: "@global_color",
                    ep: "themevariable",
                    name: "container_color"
                },
                {
                    defaultValue: "@global_line_height",
                    ep: "themevariable",
                    name: "container_line_height"
                },
                {
                    defaultValue: "@global_pane_background",
                    ep: "themevariable",
                    name: "pane_bg"
                },
                {
                    defaultValue: "@global_pane_border_radius",
                    ep: "themevariable",
                    name: "pane_border_radius"
                },
                {
                    defaultValue: "@global_form_font",
                    ep: "themevariable",
                    name: "form_font"
                },
                {
                    defaultValue: "@global_form_font_size",
                    ep: "themevariable",
                    name: "form_font_size"
                },
                {
                    defaultValue: "@global_form_line_height",
                    ep: "themevariable",
                    name: "form_line_height"
                },
                {
                    defaultValue: "@global_form_color",
                    ep: "themevariable",
                    name: "form_color"
                },
                {
                    defaultValue: "@global_form_text_shadow",
                    ep: "themevariable",
                    name: "form_text_shadow"
                },
                {
                    defaultValue: "@global_pane_link_color",
                    ep: "themevariable",
                    name: "pane_a_color"
                },
                {
                    defaultValue: "@global_font",
                    ep: "themevariable",
                    name: "pane_font"
                },
                {
                    defaultValue: "@global_font_size",
                    ep: "themevariable",
                    name: "pane_font_size"
                },
                {
                    defaultValue: "@global_pane_text_shadow",
                    ep: "themevariable",
                    name: "pane_text_shadow"
                },
                {
                    defaultValue: "@global_pane_h1_font",
                    ep: "themevariable",
                    name: "pane_h1_font"
                },
                {
                    defaultValue: "@global_pane_h1_font_size",
                    ep: "themevariable",
                    name: "pane_h1_font_size"
                },
                {
                    defaultValue: "@global_pane_h1_color",
                    ep: "themevariable",
                    name: "pane_h1_color"
                },
                {
                    defaultValue: "@global_font_size * 1.8",
                    ep: "themevariable",
                    name: "pane_line_height"
                },
                {
                    defaultValue: "@global_pane_color",
                    ep: "themevariable",
                    name: "pane_color"
                },
                {
                    defaultValue: "@global_text_shadow",
                    ep: "themevariable",
                    name: "pane_text_shadow"
                },
                {
                    defaultValue: "@global_font",
                    ep: "themevariable",
                    name: "button_font"
                },
                {
                    defaultValue: "@global_font_size",
                    ep: "themevariable",
                    name: "button_font_size"
                },
                {
                    defaultValue: "@global_button_color",
                    ep: "themevariable",
                    name: "button_color"
                },
                {
                    defaultValue: "@global_button_background",
                    ep: "themevariable",
                    name: "button_bg"
                },
                {
                    defaultValue: "@button_bg - #063A27",
                    ep: "themevariable",
                    name: "button_bg2"
                },
                {
                    defaultValue: "@button_bg - #194A5E",
                    ep: "themevariable",
                    name: "button_border"
                },
                {
                    defaultValue: "@global_control_background",
                    ep: "themevariable",
                    name: "control_bg"
                },
                {
                    defaultValue: "@global_control_color",
                    ep: "themevariable",
                    name: "control_color"
                },
                {
                    defaultValue: "@global_control_border",
                    ep: "themevariable",
                    name: "control_border"
                },
                {
                    defaultValue: "@global_control_border_radius",
                    ep: "themevariable",
                    name: "control_border_radius"
                },
                {
                    defaultValue: "@global_control_active_background",
                    ep: "themevariable",
                    name: "control_active_bg"
                },
                {
                    defaultValue: "@global_control_active_border",
                    ep: "themevariable",
                    name: "control_active_border"
                },
                {
                    defaultValue: "@global_control_active_color",
                    ep: "themevariable",
                    name: "control_active_color"
                },
                {
                    defaultValue: "@global_control_active_inset_color",
                    ep: "themevariable",
                    name: "control_active_inset_color"
                }],
                type: "plugins/supported",
                name: "screen_theme"
            }
        })
    })
})();
(function () {
    var y = bespin.tiki.require("jquery").$,
        s = function (v, r, l) {
            v = v.style[l] || document.defaultView.getComputedStyle(v, "").getPropertyValue(l);
            if (!v || v == "auto" || v == "intrinsic") v = r.style[l];
            return v
        };
    bespin.useBespin = function (v, r) {
        var l = bespin.tiki.require("bespin:util/util"),
            h = {},
            d = h.settings;
        r = r || {};
        for (var f in r) h[f] = r[f];
        r = h.settings;
        if (d !== undefined) for (f in d) if (r[f] === undefined) h.settings[f] = d[f];
        var m = null,
            i = new(bespin.tiki.require("bespin:promise").Promise);
        bespin.tiki.require.ensurePackage("::appconfig", function () {
            var g = bespin.tiki.require("appconfig");
            if (l.isString(v)) v = document.getElementById(v);
            if (l.none(h.initialContent)) h.initialContent = v.value || v.innerHTML;
            v.innerHTML = "";
            if (v.type == "textarea") {
                var j = v.parentNode,
                    q = document.createElement("div"),
                    t = function () {
                        var C = "position:relative;";
                        ["margin-top", "margin-left", "margin-right", "margin-bottom"].forEach(function (L) {
                            C += L + ":" + s(v, q, L) + ";"
                        });
                        var e = s(v, q, "width"),
                            K = s(v, q, "height");
                        C += "height:" + K + ";width:" + e + ";";
                        C += "display:inline-block;";
                        q.setAttribute("style", C)
                    };
                window.addEventListener("resize", t, false);
                t();
                for (v.nextSibling ? j.insertBefore(q, v.nextSibling) : j.appendChild(q);j !== document;) {
                    if (j.tagName.toUpperCase() === "FORM") {
                        var B = j.onsubmit;
                        j.onsubmit = function (C) {
                            v.value = m.editor.value;
                            v.innerHTML = m.editor.value;
                            B && B.call(this, C)
                        };
                        break
                    }
                    j = j.parentNode
                }
                v.style.display = "none";
                h.element = q;
                if (!l.none(v.getAttribute("readonly"))) h.readOnly = true
            } else h.element = v;
            g.launch(h).then(function (C) {
                m = C;
                i.resolve(C)
            })
        });
        return i
    };
    y(document).ready(function () {
        for (var v = [], r = document.querySelectorAll(".bespin"), l = 0; l < r.length; l++) {
            var h = r[l],
                d = h.getAttribute("data-bespinoptions") || "{}";
            d = bespin.useBespin(h, JSON.parse(d));
            d.then(function (f) {
                h.bespin = f
            }, function (f) {
                throw new Error("Launch failed: " + f);
            });
            v.push(d)
        }
        if (window.onBespinLoad) {
            r = bespin.tiki.require("bespin:promise").group;
            r(v).then(function () {
                window.onBespinLoad()
            }, function () {
                throw new Error("At least one Bespin failed to launch!");
            })
        }
    })
})();