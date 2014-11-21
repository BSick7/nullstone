module nullstone.markup {
    export interface IMarkupDependencyResolver<T> {
        add(uri: string, name: string): boolean;
        collect(root: T);
        resolve(): async.IAsyncRequest<any>;
    }
    export class MarkupDependencyResolver<T> implements IMarkupDependencyResolver<T> {
        private $$uris: string[] = [];
        private $$names: string[] = [];
        private $$resolving: string[] = [];

        constructor (public typeManager: ITypeManager, public parser: IMarkupParser<T>) {
        }

        collect (root: T) {
            var blank = {};
            this.parser
                .on({
                    resolveType: (uri, name) => {
                        this.add(uri, name);
                        return Object;
                    },
                    resolveObject: (type) => {
                        return blank;
                    }
                })
                .parse(root);
        }

        add (uri: string, name: string): boolean {
            var uris = this.$$uris;
            var names = this.$$names;
            var ind = uris.indexOf(uri);
            if (ind > -1 && names[ind] === name)
                return false;
            if (this.$$resolving.indexOf(uri + "/" + name) > -1)
                return false;
            uris.push(uri);
            names.push(name);
            return true;
        }

        resolve (): async.IAsyncRequest<any> {
            var as: async.IAsyncRequest<any>[] = [];
            for (var i = 0, uris = this.$$uris, names = this.$$names, tm = this.typeManager, resolving = this.$$resolving; i < uris.length; i++) {
                var uri = uris[i];
                var name = names[i];
                resolving.push(uri + "/" + name);
                as.push(tm.loadTypeAsync(uri, name));
            }
            return async.many(as);
        }
    }
}