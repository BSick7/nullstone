declare module nullstone {
    var version: string;
}
declare module nullstone {
    class DirResolver implements ITypeResolver {
        public resolveType(moduleName: string, name: string, oresolve: IOutType): boolean;
    }
}
declare module nullstone {
    class Enum {
        public Object: any;
        constructor(Object: any);
    }
}
declare module nullstone {
    interface IEventArgs {
    }
    interface IEventCallback<T extends IEventArgs> {
        (sender: any, args: T): any;
    }
    class Event<T extends IEventArgs> {
        private $$callbacks;
        private $$scopes;
        public has : boolean;
        public on(callback: IEventCallback<T>, scope: any): void;
        public off(callback: IEventCallback<T>, scope: any): void;
        public raise(sender: any, args: T): void;
        public raiseAsync(sender: any, args: T): void;
    }
}
declare module nullstone {
    interface IInterfaceDeclaration<T> {
        name: string;
        is(o: any): boolean;
        as(o: any): T;
    }
    class Interface<T> implements IInterfaceDeclaration<T> {
        public name: string;
        constructor(name: string);
        public is(o: any): boolean;
        public as(o: any): T;
    }
}
declare module nullstone {
    interface ICollection<T> {
        GetValueAt(index: number): T;
        SetValueAt(index: number, value: T): any;
    }
    var ICollection_: Interface<{}>;
}
declare module nullstone {
    interface ITypeResolver {
        resolveType(moduleName: string, name: string, oresolve: IOutType): boolean;
    }
}
declare module nullstone {
    interface IIndexedPropertyInfo {
        getValue(obj: any, index: number): any;
        setValue(obj: any, index: number, value: any): any;
    }
    class IndexedPropertyInfo implements IIndexedPropertyInfo {
        public GetFunc: (index: number) => any;
        public SetFunc: (index: number, value: any) => any;
        public propertyType : Function;
        public getValue(ro: any, index: number): any;
        public setValue(ro: any, index: number, value: any): void;
        static find(typeOrObj: any): IndexedPropertyInfo;
    }
}
declare module nullstone {
    interface ILibrary {
        uri: string;
        rootModule: any;
        loadAsync(onLoaded: (rootModule: any) => any): any;
        resolveType(moduleName: string, name: string, oresolve: IOutType): boolean;
        add(name: string, type: any): ILibrary;
        addPrimitive(name: string, type: any): ILibrary;
        addEnum(name: string, enu: any): ILibrary;
    }
    class Library implements ILibrary {
        private $$libpath;
        private $$module;
        private $$primtypes;
        private $$types;
        constructor(uri: string);
        public uri: string;
        public rootModule : any;
        public loadAsync(onLoaded?: (rootModule: any) => any): void;
        public resolveType(moduleName: string, name: string, oresolve: IOutType): boolean;
        public add(name: string, type: any): ILibrary;
        public addPrimitive(name: string, type: any): ILibrary;
        public addEnum(name: string, enu: any): ILibrary;
    }
}
declare module nullstone {
    interface ILibraryResolver extends ITypeResolver {
        resolve(uri: string): ILibrary;
    }
    class LibraryResolver implements ILibraryResolver {
        private $$libs;
        public dirResolver: DirResolver;
        public resolve(uri: string): ILibrary;
        public resolveType(uri: string, name: string, oresolve: IOutType): boolean;
    }
}
declare module nullstone {
    function getPropertyDescriptor(obj: any, name: string): PropertyDescriptor;
    function hasProperty(obj: any, name: string): boolean;
}
declare module nullstone {
    interface IPropertyInfo {
        getValue(obj: any): any;
        setValue(obj: any, value: any): any;
    }
    class PropertyInfo implements IPropertyInfo {
        private $$getFunc;
        private $$setFunc;
        public getValue(obj: any): any;
        public setValue(obj: any, value: any): any;
        static find(typeOrObj: any, name: string): IPropertyInfo;
    }
}
declare module nullstone {
    function getTypeName(type: Function): string;
    function getTypeParent(type: Function): Function;
    function addTypeInterfaces(type: Function, ...interfaces: IInterfaceDeclaration<any>[]): void;
}
declare module nullstone {
    function convertAnyToType(val: any, type: Function): any;
    function registerTypeConverter(type: Function, converter: (val: any) => any): void;
    function registerEnumConverter(e: any, converter: (val: any) => any): void;
}
declare module nullstone {
    enum UriKind {
        RelativeOrAbsolute = 0,
        Absolute = 1,
        Relative = 2,
    }
    class Uri {
        private $$originalString;
        private $$kind;
        constructor(uri: Uri);
        constructor(uri: string, kind?: UriKind);
        public kind : UriKind;
        public host : string;
        public absolutePath : string;
        public scheme : string;
        public fragment : string;
        public originalString : string;
        public toString(): string;
        public equals(other: Uri): boolean;
        static isNullOrEmpty(uri: Uri): boolean;
    }
}
declare module nullstone {
    interface IOutType {
        type: any;
        isPrimitive: boolean;
    }
    interface ITypeManager {
        resolveType(uri: string, name: string, oresolve: IOutType): boolean;
        add(uri: string, name: string, type: any): ITypeManager;
        addPrimitive(uri: string, name: string, type: any): ITypeManager;
        addEnum(uri: string, name: string, enu: any): ITypeManager;
    }
    class TypeManager implements ITypeManager {
        public defaultUri: string;
        public xUri: string;
        public libResolver: ILibraryResolver;
        constructor(defaultUri: string, xUri: string);
        public resolveType(uri: string, name: string, oresolve: IOutType): boolean;
        public add(uri: string, name: string, type: any): ITypeManager;
        public addPrimitive(uri: string, name: string, type: any): ITypeManager;
        public addEnum(uri: string, name: string, enu: any): ITypeManager;
    }
}
declare module nullstone {
    function Annotation(type: Function, name: string, value: any, forbidMultiple?: boolean): void;
    function GetAnnotations(type: Function, name: string): any[];
    interface ITypedAnnotation<T> {
        (type: Function, ...values: T[]): any;
        Get(type: Function): T[];
    }
    function CreateTypedAnnotation<T>(name: string): ITypedAnnotation<T>;
}
declare module nullstone {
    function equals(val1: any, val2: any): boolean;
}
