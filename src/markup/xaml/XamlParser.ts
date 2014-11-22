module nullstone.markup.xaml {
    export var DEFAULT_XMLNS = "http://schemas.wsick.com/fayde";
    export var DEFAULT_XMLNS_X = "http://schemas.wsick.com/fayde/x";
    var ERROR_XMLNS = "http://www.w3.org/1999/xhtml";
    var ERROR_NAME = "parsererror";

    export class XamlParser implements IMarkupParser<Element> {
        private $$onResolveType: events.IResolveType;
        private $$onResolveObject: events.IResolveObject;
        private $$onResolvePrimitive: events.IResolvePrimitive;
        private $$onElementSkip: events.IElementSkip<Element>;
        private $$onObject: events.IObject;
        private $$onObjectEnd: events.IObject;
        private $$onContentObject: events.IObject;
        private $$onContentText: events.IText;
        private $$onName: events.IName;
        private $$onKey: events.IKey;
        private $$onPropertyStart: events.IPropertyStart;
        private $$onPropertyEnd: events.IPropertyEnd;
        private $$onResourcesStart: events.IResourcesStart;
        private $$onResourcesEnd: events.IResourcesEnd;
        private $$onError: events.IError;
        private $$onEnd: () => any = null;

        private $$extension: IMarkupExtensionParser;

        private $$defaultXmlns: string;
        private $$xXmlns: string;

        private $$objectStack: any[] = [];
        private $$skipnext = false;

        constructor () {
            this.setExtensionParser(new XamlExtensionParser())
                .setNamespaces(DEFAULT_XMLNS, DEFAULT_XMLNS_X)
                .on({});
        }

        on (listener: IMarkupSax<Element>): XamlParser {
            listener = createMarkupSax(listener);

            this.$$onResolveType = listener.resolveType;
            this.$$onResolveObject = listener.resolveObject;
            this.$$onResolvePrimitive = listener.resolvePrimitive;
            this.$$onElementSkip = listener.elementSkip;
            this.$$onObject = listener.object;
            this.$$onObjectEnd = listener.objectEnd;
            this.$$onContentObject = listener.contentObject;
            this.$$onContentText = listener.contentText;
            this.$$onName = listener.name;
            this.$$onKey = listener.key;
            this.$$onPropertyStart = listener.propertyStart;
            this.$$onPropertyEnd = listener.propertyEnd;
            this.$$onResourcesStart = listener.resourcesStart;
            this.$$onResourcesEnd = listener.resourcesEnd;
            this.$$onError = listener.error;
            this.$$onEnd = listener.end;

            if (this.$$extension) {
                this.$$extension
                    .onResolveType(this.$$onResolveType)
                    .onResolveObject(this.$$onResolveObject)
                    .onResolvePrimitive(this.$$onResolvePrimitive);
            }

            return this;
        }

        setNamespaces (defaultXmlns: string, xXmlns: string): XamlParser {
            this.$$defaultXmlns = defaultXmlns;
            this.$$xXmlns = xXmlns;
            if (this.$$extension)
                this.$$extension.setNamespaces(this.$$defaultXmlns, this.$$xXmlns);
            return this;
        }

        setExtensionParser (parser: IMarkupExtensionParser): XamlParser {
            this.$$extension = parser;
            if (parser) {
                parser.setNamespaces(this.$$defaultXmlns, this.$$xXmlns)
                    .onResolveType(this.$$onResolveType)
                    .onResolveObject(this.$$onResolveObject)
                    .onResolvePrimitive(this.$$onResolvePrimitive)
                    .onError((e) => {
                        throw e;
                    });
            }
            return this;
        }

        parse (el: Element): XamlParser {
            if (!this.$$extension)
                throw new Error("No extension parser exists on parser.");
            this.$$handleElement(el, true);
            this.$$destroy();
            return this;
        }

        skipNextElement () {
            this.$$skipnext = true;
        }

        private $$handleElement (el: Element, isContent: boolean) {
            // NOTE: Handle tag open
            //  <[ns:]Type.Name>
            //  <[ns:]Type>
            var name = el.localName;
            var xmlns = el.namespaceURI;
            if (this.$$tryHandleError(el, xmlns, name))
                return;
            if (this.$$tryHandlePropertyTag(el, xmlns, name))
                return;

            var ort = this.$$onResolveType(xmlns, name);
            var obj;
            if (ort.isPrimitive) {
                obj = this.$$onResolvePrimitive(ort.type, el.textContent);
                (isContent)
                    ? this.$$onContentObject(obj)
                    : this.$$onObject(obj);
                this.$$onObjectEnd(obj);
                return;
            }

            obj = this.$$onResolveObject(ort.type);

            if (this.$$skipnext) {
                this.$$skipnext = false;
                this.$$onElementSkip(el, obj);
                return;
            }

            this.$$objectStack.push(obj);

            if (isContent) {
                this.$$onContentObject(obj);
            } else {
                this.$$onObject(obj);
            }

            // NOTE: Walk attributes
            for (var i = 0, attrs = el.attributes, len = attrs.length; i < len; i++) {
                this.$$processAttribute(attrs[i]);
            }

            // NOTE: Handle resources first
            var resEl = findResourcesElement(el, xmlns, name);
            if (resEl)
                this.$$handleResources(obj, resEl);

            // NOTE: Walk Children
            var child = el.firstElementChild;
            var hasChildren = !!child;
            while (child) {
                if (!resEl || child !== resEl) //Skip Resources (will be done first)
                    this.$$handleElement(child, true);
                child = child.nextElementSibling;
            }

            // NOTE: If we did not hit a child tag, use text content
            if (!hasChildren) {
                var text = el.textContent;
                if (text)
                    this.$$onContentText(text.trim());
            }

            // NOTE: Handle tag close
            //  </[ns:]Type.Name>
            //  </[ns:]Type>
            this.$$objectStack.pop();
            this.$$onObjectEnd(obj);
        }

        private $$handleResources (owner: any, resEl: Element) {
            this.$$onResourcesStart(owner);
            var child = resEl.firstElementChild;
            while (child) {
                this.$$handleElement(child, true);
                child = child.nextElementSibling;
            }
            this.$$onResourcesEnd(owner);
        }

        private $$tryHandleError (el: Element, xmlns: string, name: string): boolean {
            if (xmlns !== ERROR_XMLNS || name !== ERROR_NAME)
                return false;
            this.$$onError(new Error(el.textContent));
            return true;
        }

        private $$tryHandlePropertyTag (el: Element, xmlns: string, name: string): boolean {
            var ind = name.indexOf('.');
            if (ind < 0)
                return false;

            var type = this.$$onResolveType(xmlns, name.substr(0, ind));
            name = name.substr(ind + 1);

            this.$$onPropertyStart(type, name);

            var child = el.firstElementChild;
            while (child) {
                this.$$handleElement(child, false);
                child = child.nextElementSibling;
            }

            this.$$onPropertyEnd(type, name);

            return true;
        }

        private $$processAttribute (attr: Attr): boolean {
            var prefix = attr.prefix;
            var name = attr.localName;
            if (this.$$shouldSkipAttr(prefix, name))
                return true;
            var uri = attr.namespaceURI;
            var value = attr.value;
            if (this.$$tryHandleXAttribute(uri, name, value))
                return true;
            return this.$$handleAttribute(uri, name, value, attr);
        }

        private $$shouldSkipAttr (prefix: string, name: string): boolean {
            if (prefix === "xmlns")
                return true;
            return (!prefix && name === "xmlns");
        }

        private $$tryHandleXAttribute (uri: string, name: string, value: string): boolean {
            //  ... x:Name="..."
            //  ... x:Key="..."
            if (uri !== this.$$xXmlns)
                return false;
            if (name === "Name")
                this.$$onName(value);
            if (name === "Key")
                this.$$onKey(value);
            return true;
        }

        private $$handleAttribute (uri: string, name: string, value: string, attr: Attr): boolean {
            //  ... [ns:]Type.Name="..."
            //  ... Name="..."

            var type = null;
            var name = name;
            var ind = name.indexOf('.');
            if (ind > -1) {
                type = this.$$onResolveType(uri, name.substr(0, ind));
                name = name.substr(ind + 1);
            }
            this.$$onPropertyStart(type, name);
            var val = this.$$getAttrValue(value, attr);
            this.$$onObject(val);
            this.$$onObjectEnd(val);
            this.$$onPropertyEnd(type, name);
            return true;
        }

        private $$getAttrValue (val: string, attr: Attr): any {
            if (val[0] !== "{")
                return val;
            return this.$$extension.parse(val, attr, this.$$objectStack);
        }

        private $$destroy () {
            this.$$onEnd && this.$$onEnd();
        }
    }

    function findResourcesElement (ownerEl: Element, uri: string, name: string): Element {
        var expected = name + ".Resources";
        var child = ownerEl.firstElementChild;
        while (child) {
            if (child.localName === expected && child.namespaceURI === uri)
                return child;
            child = child.nextElementSibling;
        }
        return null;
    }
}