/* JavaScript Selector and DOM manipulation library */
(function () {
    /* Initiate using 'Immediately Executing Function' model */
    //"use strict"; well, maybe not

    var _concat = function () {
        /*  this function accepts any number of library objects and 
            concatenates them together by appending arg 1-n to arg 0.  */
        
        if (arguments.length === 0) return null;

        var length = 0;
        for (var i = 0; i < arguments.length; i++) {
            for (var ii = 0; ii < arguments[i].length; ii++) {
                this[length++] = arguments[i][ii];
            }
        }
        
        this.length = length;
    }

    function _lib (selector, parent) {
        /* Avoid clobering the window scope by returning each instance as a new object */
        if (window === this) return new _lib(selector, parent);

        /* set __doc to document if not defined, should only be used by methods */
        parent = parent || document;

        /* set up 'this' as the return object to avoid an excessive amount of return statements */
        this.__islib__ = true;
        this.length    = 0;

        switch (true) {
            /* the function handles input differently based on type */
            case (selector instanceof HTMLElement):
                this[this.length++] = selector;
                break;
            case (selector instanceof String || typeof selector == "string"):
                /*  the selector string could be an element creation string or a DOM selection string,
                    element creation strings must be bracketted by '<' and '>'  */
                if (selector[0] == '<' && selector[selector.length - 1] == '>') {
                    selector = selector.substring(1, selector.length - 1);
                    /*  Use the 'replace' method, along with regular expressions to identify 
                        IDs, classes, name, and attributes. the 'this' object is bound to each function
                        so element changes can be made to it.  */

                    /* A tag name is required and should immediately follow the opening brace */
                    selector.replace(/^[^\#\.\$\[]*/, function (r_str) {
                        this[this.length++] = document.createElement(r_str);
                    }.bind(this));
                    if (this.length === 0) throw "Invalid Element Creation string";

                    /* Handle multiple IDs even though only the last will be usable */
                    selector.replace(/\#[^\#\.\$\[]*/g, function (r_str) {
                        this[this.length - 1].id = r_str.substring(1, r_str.length);
                        return "";
                    }.bind(this));
                    /* classes are indicated with a period */
                    selector.replace(/\.[^\#\.\$\[]*/g, function (r_str) {
                        this[this.length - 1].classList.add(r_str.substring(1, r_str.length));
                        return "";
                    }.bind(this));
                    /* Names are set with a $ since no standard is established in CSS */
                    selector.replace(/\$[^\#\.\$\[]*/g, function (r_str) {
                        this[this.length - 1].name = r_str.substring(1, r_str.length);
                        return "";
                    }.bind(this));
                    /* square brackets indicate a CSS style key-value pair for defining additional attributes */
                    selector.replace(/\[[^\=]+\=(\"[^\"]*|\'[^\']*)\]/g, function (r_str) {
                        /* found string must have square brackets, '=', and quotes stripped away */
                        r_str = r_str.substring(1, r_str.length);
                        var i = r_str.indexOf("=");
                        this[this.length - 1].setAttribute(r_str.substring(0, i), r_str.substring(i + 2, r_str.length - 1));
                        return "";
                    }.bind(this));
                } else {
                    /*  If the string is not an Element Creation String, it must be a CSS selector,
                        find elements matching it utilizing querySelectorAll, supported by all modern browsers  */
                    if (!"querySelectorAll" in parent) throw "querySelectorAll must be supported for lib to work";
                    var elements = parent.querySelectorAll(selector);
                    for (var i = 0; i < elements.length; i++) {
                        this[this.length++] = elements[i];
                    }
                }
                break;
            case (selector instanceof Number || typeof selector == "number"):
                /* This library allows for selections to be indexed for faster use later */
                if ("_index" in window._ && selector in window._._index) {
                    return window._._index[selector];
                } else {
                    throw "Index not defined";
                }
                break;
                /*  The contents of an array or generic object could be any of these other data types,
                    rather than have redundant code, the cooresponding cases will use recursion 
                    to build parse the input  */
            case (selector instanceof Array || (selector && selector.constructor === Array)):
                for (var i = 0; i < selector.length || i == 0; i++) {
                    _concat.call(this, this, _lib(selector[i]));
                }
                break;
            case (selector instanceof Object || typeof selector == "object"):
                if ("__islib__" in selector && selector.__islib__ === true) {
                    /* If the input is already a library object no parsing is necessary */
                    _concat.call(this, this, selector);
                } else if ("length" in selector) {
                    /* If the object is iterable it should have a length property */
                    for (var i = 0; i < selector.length || i == 0; i++) {
                        _concat.call(this, this, _lib(selector[i]));
                    }
                } else {
                    /* If the input is of an unsupported type, return the equivalent of undefined input */
                    _concat.call(this, this, _lib(undefined));
                }
                break;
            case (selector instanceof Function || typeof selector == "function"):
                throw "lib cannot accept an input of type 'Function'";
                break;
            default:
                this[this.length++] = document;
                break;
            
        }

        return this;
    };

    window._ = _lib;

    _lib.prototype = window._.fn = {
        /*  All prototype methods should return this if a value is not requested,
            this allows for chaining of methods  */
        index: function (num) {
            /* Add the current selection to the index, at the specified number */
            if (!(num instanceof Number || typeof num == "number")) throw "Method index only accpets an argument of type Number.";
            if (!("_index" in window._)) window._._index = {};
            window._._index[num] = this;

            return this;
        },
        include: function (selector) {
            _concat.call(this, this, _lib(selector));

            return this;
        },
        exclude: function (selector) {
            /* excludes elements from the current selection if they match the input selection */
            var exclusion = _lib(selector);
            var i = this.length, ii = 0;
            var result = [];
            while (i--) {
                ii = exclusion.length;
                while (ii--) {
                    if (this[i] !== exclusion[ii]) result.unshift(this[i]);
                }
            }

            return _lib(result);
        },
        get: function (num) {
            /* changes the selection to include only the elemnt at the inputted index of the current selection */
            if (!(num instanceof Number || typeof num == "number")) throw "Method get only accepts an argument of type Number";
            return _lib(this[num]);
        },
        raw: function (num) {
            /* returns the raw HTML element at a particular index */
            if (!(num instanceof Number || typeof num == "number")) throw "Method get only accepts an argument of type Number";
            return this[num];
        },
        remove: function () {
            /* removes all elements from the DOM, elements are still returned as they could be added back */
            for (var i = this.length; i--; this[i].parentNode.removeChild(this[i]));

            return this;
        },
        each: function (func) {
            if (!(func instanceof Function || typeof func == "function")) throw "Method each only accepts an argument of type Function";
            /* call the specified function on each element in the selection */
            for (var i = this.length; i--; func(_lib(this[i])));
            return this;
        },
        filter: function (func) {
            if (!(func instanceof Function || typeof func == "function")) throw "Method each only accepts an argument of type Function";
            /*  call the specified function on each element and keep it
                in the selection only if the function evaluates to true  */
            var result = [];
            for (var i = 0; i < this.length; i++)
                if (func(_lib(this[i]))) result.push(this[i]);

            return _lib(result);
        },
        child: function (selector) {
            /*  return a selector of all children matching the given selector
                of each element currently in the selection. */
            var i = this.length, result = new Array(this.length);
            for (var i = this.length; i--; result[i] = _lib(selector, this[i]));
            
            return _lib(result);
        },
        parent: function () {
            /*  return a selection of the parents of each currently selected element
                if a parent is repeated it is not returned  */
            var result = [], check = true;
            for (var i = 0; i < this.length; i++) {
                result.push(this[i].parentNode);
                /* check all previously found parents to make sure none are repeated */
                for (var ii = i; ii--; check = check && result[i] !== result[ii]);
                if (!check) result.pop();
            }

            return _lib(result);
        },
        /* The algorithm for sibling is not particularly space efficient at this stage of development */
        sibling: function (selector) {
            /* returns a selection of the siblings of each child that match the input selection */
            var interm = [], check = true;
            for (var i = 0; i < this.length; i++) {
                interm.push(_lib(selector, this[i]));
            }
            
            /* The interm array may hold iterable objects as elements. Calling _lib on it will flatten it,
               allowing duplicates to be removed iteratively */
            var interm2 = _lib(interm);
            var result = [];
            for (var i = 0; i < interm2.length; i++) {
                result.push(interm2[i]);
                for (var ii = i; i--; check = check && result[i] !== result[ii]);
                if (!check) result.pop();
            }
            
            return _lib(result);
        },
        appendTo: function (parent) {
            /* An undefined parent could cause issues */
            if (!parent) throw "Method appendTo expects an argument";
            /* To increase code simplicity the input argument is passed into the library constructor */
            parent = _lib(parent);
            for (var i = 0; i < this.length; i++) parent[0].appendChild(this[i]);

            return this;
        },
        append: function (children) {
            /* Undefined children will result in errors */
            if (!children) throw "Method append expects an argument";
            /* As seen before the argument is passed into the library constructor for type safety */
            children = _lib(children);
            /*  Children can only be appended to one element
                so it makes sense to append them to the first element in the selection  */
            for (var i = 0; i < children.length; i++) this[0].appendChild(children[i]);

            return this;
        },
        prependTo: function (parent) {
            /* An undefined parent could cause issues */
            if (!parent) throw "Method prependTo expects an argument";
             /* To increase code simplicity the input argument is passed into the library constructor */
            parent = _lib(parent);
            for (var i = 0; i < this.length; i++) {
                if (parent[0].hasChildNodes()) {
                      parent[0].insertBefore(this[i], parent[0].childNodes[0]); 
                } else {
                    parent[0].appendChild(this[i]);   
                }
            }

            return this;
        },
        prepend: function (children) {
            /* Undefined children will result in errors */
            if (!children) throw "Method prepend expects an argument";
            /* As seen before the argument is passed into the library constructor for type safety */
            children = _lib(children);
            /*  Children can only be prepended to one element
                so it makes sense to prepend them to the first element in the selection  */
            for (var i = 0; i < children.length; i++) {
                if (this[0].hasChildNodes()) {
                    this[0].insertBefore(children[i], this[0].childNodes[0]);
                } else {
                    this[0].appendChild(children[i]);
                }
            }

            return this;
        },
        toggleClass: function (str) {
            if (!(str instanceof String || typeof str == "string")) throw "Method toggleClass only accepts an argument of type String";
            /* check if each selected element contains the specified class and either add or remove it accordingly */
            for (var i = 0; i < this.length; i++) {
                if (this[i].classList.contains(str)) {
                    this[i].classList.remove(str);
                } else {
                    this[i].classList.add(str);
                }
            }

            return this;
        },
        hasClass: function (str) {
            if (!(str instanceof String || typeof str == "string")) throw "Method hasClass only accepts an argument of type String";
            /* determine if all elements contain the specified class */
            var i = 0, result = true;
            while (i < this.length && result) result = result & this[i++].classList.contains(str);

            return result;
        },
        addClass: function (str) {
            if (!(str instanceof String || typeof str == "string")) throw "Method addClass only accepts an argument of type String";
            /* add the specified class to each selected element */
            for (var i = this.length; i--; this[i].classList.add(str));

            return this;
        },
        dropClass: function (str) {
            if (!(str instanceof String || typeof str == "string")) throw "Method dropClass only accepts an argument of type String";
            /* remove the specified class from each selected element */
            for (var i = this.length; i--; this[i].classList.remove(str));

            return this;
        },
        css: function (args) {
            /* gets or sets css values on each selected element */
            if (arguments.length == 0) {
                /* if no arguments are given throw an error */
                throw "Method css expects an arguments";
            } else if (arguments.length == 1) {
                if (args instanceof String || typeof args == "string") {
                    /*  allow css values to be set by a css string (i.e. color:red;)
                        if only one argument is given which isnt a css string return the value of that css style */
                    if (selector.indexOf(":") == -1) return this[0].style[args];
                    else {
                        args = args.split(";");
                        for (var i = 0; i < args.length; i++) {
                            for (var ii = this.length; ii--;
                                this[ii].style[args[i].split(":")[0].trim()] = args[i].split(":")[1].trim());
                        }
                    }
                } else if (args instanceof Array || args.constructor === Array) {
                    /* Allow an array of key, value pairs to be used to set css */
                    if (!(args[0] instanceof String)) throw "Method css only accepts an input of String Arrays";
                    for (var i = 0; i < args.length - args.length % 2; i += 2) {
                        if (args[i] instanceof String && args[i + 1] instanceof String) {
                            for (var i = this.length; i--; this[i].style[args[i]] = args[i + 1]);
                        }
                    }
                } else if (args instanceof Object || typeof args == "object") {
                    /* Allow an object of key:value pairs to be used to set css */
                    for (var key in args) {
                        for (var i = this.length; i--; this[i].style[key] = args[key]);
                    }
                }
            } else {
                /* Allow any number of arguments to be used in the order: key, value, key2, value2, ... */
                for (var i = 0; i < arguments.length - arguments.length % 2; i += 2) {
                    if ((arguments[i] instanceof String || typeof arguments[i] == "string") && (arguments[i + 1] instanceof String || typeof arguments[i + 1] == "string")) {
                        for (var j = this.length; j--; this[j].style[arguments[i]] = arguments[i + 1]);
                    }
                }
            }

            return this;
        },
        attr: function (args) {
            /* gets or sets attribute(s) of each element in the selection */
            if (arguments.length == 0) {
                throw "Method attr expects an argument.";
            } else if (arguments.length == 1) {
                if (args instanceof String || typeof args == "string") {
                    return this[0].getAttribute(args)
                } else throw "Method attr can only accept a single argument of type String";
            } else {
                for (var i = 0; i < arguments.length - arguments.length % 2; i += 2) {
                    for (var ii = this.length; ii--; this[ii].setAttribute(arguments[i], arguments[i+1]));
                }
            }

            return this;
        },
        prop: function (args) {
            /* gets or sets javascript object properties(s) of each element in the selection */
            if (arguments.length == 0) {
                throw "Method prop expects an argument.";
            } else if (arguments.length == 1) {
                if (args instanceof String || typeof args == "string") {
                    return this[0][args];
                } else throw "Method prop can only accept a single argument of type String";
            } else {
                for (var i = 0; i < arguments.length - arguments.length % 2; i += 2) {
                    for (var ii = this.length; ii--; this[ii][arguments[i]] =  arguments[i+1]);
                }
            }

            return this;
        },
        text: function (str) {
            /* gets or sets the innerText of each element in the selection */
            if (str instanceof String || typeof str == "string") {
                for (var i = this.length; i--; this[i].innerText = str);
            } else {
                return this[0].innerText;
            }

            return this;
        },
        html: function (str) {
            /* gets or sets the innerHTML of each element in the selection */
            if (str instanceof String || typeof str == "string") {
                for (var i = this.length; i--; this[i].innerHTML = str);
            } else {
                return this[0].innerHTML;
            }

            return this;
        },
        value: function (str) {
            /* gets or sets the value of each element in the selection */
            if (str instanceof String || typeof str == "string") {
                for (var i = this.length; i--; this[i].value = str);
            } else {
                return this[0].value;
            }

            return this;
        },
        height: function () {
            return (this[0].offsetHeight || this[0].clientHeight || this[0].scrollHeight);
        },
        width: function () {
            return (this[0].offsetWidth || this[0].clientWidth || this[0].scrollWidth);
        },
        on: function (str, obj) {
            /* adds one or more event listeners to each element in the selection */
            if (arguments.length == 0) throw "Method on expects an argument";
            else if (arguments.length == 1 && (str instanceof Object || typeof str == "object")) {
                for (var key in str) {
                    for (var i = this.length; i--; this[i].addEventListener(key.replace(/^on/,""), str[key]));
                }
            } else {
                for (var i = 0; i < arguments.length - arguments.length % 2; i+=2) {
                    for (var ii = this.length; ii--; this[ii].addEventListener(arguments[i].replace(/^on/,""), arguments[i + 1]));
                }
            }

            return this;
        },
        trigger: function (str, args) {
            /*  trigger a specified event on each element in the selection,
                this method only works for mouse and keyboard events  */
            if (!(str instanceof String || typeof str == "string")) throw "Method trigger only accepts a first argument of type String";
            str = str.replace(/^on/, "");
            switch (true) {
                case (str.indexOf("key") == 0):
                    /* if the event begins with 'key', dispatch a KeyboardEvent */
                    for (var i = 0; i < this.length; i++) {
                        var opts = {};
                        if (args instanceof Object || typeof args == "object") opts = args;
                        opts["relatedTarget"] = this[i];
                        var ev = new KeyboardEvent(str, opts);
                        this[i].dispatchEvent(ev);
                    }
                    break;
                    /*  All other event will be dispatched as MouseEvents
                        Some events require a specific button index  */
                case (str == "click" || str == "mouseup" || str == "mousedown"):
                    for (var i = 0; i < this.length; i++) {
                        var opts = {};
                        if (args instanceof Object || typeof args == "object") opts = args;
                        opts["button"] = 0;
                        opts["relatedTarget"] = this[i];
                        var ev = new MouseEvent(str, opts);
                        this[i].dispatchEvent(ev);
                    }
                    break;
                case (str == "contextmenu"):
                    for (var i = 0; i < this.length; i++) {
                        var opts = {};
                        if (args instanceof Object || typeof args == "object") opts = args;
                        opts["button"] = 2;
                        opts["relatedTarget"] = this[i];
                        var ev = new MouseEvent(str, opts);
                        this[i].dispatchEvent(ev);
                    }
                    break;
                default:
                    for (var i = 0; i < this.length; i++) {
                        var opts = {};
                        if (args instanceof Object || typeof args == "object") opts = args;
                        opts["relatedTarget"] = this[i];
                        var ev = new MouseEvent(str, opts);
                        this[i].dispatchEvent(ev);
                    }
                    break;
            }

            return this;
        }
    };

    window._.xhr = function (type, url, callback, data) {
        var ajax = new XMLHttpRequest();
        if (type instanceof Object || typeof type == "object") {
            ajax.open(type.type, type.url, true);
            ajax.onreadystatechange = (function () {
                if (ajax.readyState == 4 && ajax.status == 200) {
                    this.cb(ajax.responseText);
                }
            }).bind(ajax);
            ajax.cb = type.callback;
            ajax.send((type.data || ""));
        } else {
            ajax.open(type, url, true);
            ajax.onreadystatechange = (function () {
                if (ajax.readyState == 4 && ajax.status == 200) {
                    this.cb(ajax.responseText);
                }
            }).bind(ajax);
            ajax.cb = callback;
            ajax.send((data || ""));
        }
    };
    window._.cors = function (type, url, callback, credentials, data) {
        var ajax = ("withCredentials" in new XMLHttpRequest() ? new XMLHttpRequest() : (null));
        if (ajax == null) throw "CORS not supported.";
        if (type instanceof Object || typeof type == "object") {
            ajax.open(type.type, type.url, true);
            ajax.withCredentials = type.credentials;
            ajax.cb = type.callback;
            ajax.onload = (function () { this.cb(ajax.responseText); }).bind(ajax);
            ajax.send((type.data || ""));
        } else {
            ajax.open(type, url, true);
            ajax.withCredentials = credentials;
            ajax.cb = callback;
            ajax.onload = (function () { this.cb(ajax.responseText); }).bind(ajax);
            ajax.send((data || ""));
        }
    };
    window._.jsnop = function (url, callback) {
        var scrpt = document.createElement("script");
        var salt = (Math.floor(Math.random() * 100) + 1);
        if (url instanceof Object || typeof url == "object") {
            window["fnctn" + salt] = url.callback;
            scrpt.src = url.url + "fnctn" + salt;
            _("head").append(scrpt);
            scrpt.onload = function () { _(this).remove(); }
        } else {
            window["fnctn" + salt] = callback;
            scrpt.src = url + "fnctn" + salt;
            _("head").append(scrpt);
            scrpt.onload = function () { _(this).remove(); }
        }
    };
})();
