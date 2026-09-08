export declare const ARCHIVED_INVOCATIONS: {
    id: string;
    service: string;
    namespace: string;
    method: "create" | "close" | "selectModel";
    implementation: string;
    invocation: {
        kind: "direct";
    };
    parameters: {
        name: string;
        wire: string;
        source: "json";
        codec: {
            mode: "strict";
            typeSymbol: string;
            schema: {
                parse(value: unknown): unknown;
            };
        };
    }[];
    result: {
        mode: "strict";
        typeSymbol: string;
        schema: {
            parse(value: unknown): unknown;
        };
    };
    sourceLocation: {
        file: string;
        line: number;
        column: number;
    };
}[];
export declare const TYPERT: {
    package: string;
    face: string;
    schemas: never[];
    model: {
        services: never[];
        events: never[];
        objects: never[];
    };
    invocations: {
        id: string;
        service: string;
        namespace: string;
        method: "create" | "close" | "selectModel";
        implementation: string;
        invocation: {
            kind: "direct";
        };
        parameters: {
            name: string;
            wire: string;
            source: "json";
            codec: {
                mode: "strict";
                typeSymbol: string;
                schema: {
                    parse(value: unknown): unknown;
                };
            };
        }[];
        result: {
            mode: "strict";
            typeSymbol: string;
            schema: {
                parse(value: unknown): unknown;
            };
        };
        sourceLocation: {
            file: string;
            line: number;
            column: number;
        };
    }[];
};
export default TYPERT;
