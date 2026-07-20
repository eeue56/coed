import type { Result } from "./types.ts";

type Row<tree> = {
    kind: "Row";
    id: number;
    tree: tree;
    label: string;
    timesUsed: number;
    feedbackGiven: string[];
};

type OpenMode = { kind: "in-memory" } | { kind: "on-disk"; path: string };
type Status = { kind: "open" } | { kind: "closed" };
type Connection<tree> =
    | { kind: "sqlite" }
    | { kind: "indexeddb" }
    | { kind: "in-memory"; rows: Row<tree>[] };

type StorageState<tree> = {
    mode: OpenMode;
    status: Status;
    connection: Connection<tree>;
};

/**
 * creates the underlying table, or reopens it if it's available
 */
function open<tree>(mode: OpenMode, storage: Storage<tree>): Storage<tree> {
    switch (mode.kind) {
        case "in-memory": {
            storage._status = {
                mode,
                status: { kind: "open" },
                connection: { kind: "in-memory", rows: [] },
            };

            return storage;
        }

        case "on-disk": {
            storage._status = {
                mode,
                status: { kind: "open" },
                connection: { kind: "sqlite" },
            };

            return storage;
        }
    }
}

function close<tree>(storage: Storage<tree>): Storage<tree> {
    storage._status.status = { kind: "closed" };
    return storage;
}

function save<tree>(
    tree: tree,
    label: string,
    feedbackGiven: string[],
    storage: Storage<tree>,
): { id: number } {
    switch (storage._status.connection.kind) {
        case "in-memory": {
            storage._status.connection.rows.push({
                kind: "Row",
                id: storage._status.connection.rows.length,
                tree,
                label,
                timesUsed: 0,
                feedbackGiven,
            });
            return { id: storage._status.connection.rows.length - 1 };
        }

        case "sqlite":
        case "indexeddb":
            throw new Error("Not implemented");
    }
}

function lookup<tree>(id: number, storage: Storage<tree>): Result<Row<tree>> {
    switch (storage._status.connection.kind) {
        case "in-memory": {
            const row = storage._status.connection.rows.find(
                (row) => row.id === id,
            );
            if (row) {
                return { kind: "Ok", value: row };
            } else {
                return { kind: "Err", error: "Not found" };
            }
        }

        case "sqlite":
        case "indexeddb":
            throw new Error("Not implemented");
    }
}

function search<tree>(query: string, storage: Storage<tree>): Row<tree>[] {
    switch (storage._status.connection.kind) {
        case "in-memory": {
            const rows = storage._status.connection.rows.filter((row) =>
                row.label.includes(query),
            );
            return rows;
        }

        case "sqlite":
        case "indexeddb":
            throw new Error("Not implemented");
    }
}

function rowCount<tree>(storage: Storage<tree>): number {
    switch (storage._status.connection.kind) {
        case "in-memory": {
            return storage._status.connection.rows.length;
        }

        case "sqlite":
        case "indexeddb":
            throw new Error("Not implemented");
    }
}

/**
 * each tree is stored in a db so that it can be compared
 *
 * addtionally, associated content (e.g commit/context/prompt) can be stored
 *
 * Uses sqlite on node, and indexeddb in the browser
 *
 * (todo: implement sqlite/indexeddb integration)
 */
export type Storage<tree> = {
    open: (mode: OpenMode) => void;
    close: () => void;
    save: (
        tree: tree,
        label: string,
        feedbackGiven: string[],
    ) => { id: number };
    lookup: (id: number) => Result<Row<tree>>;
    search: (query: string) => Row<tree>[];
    rowCount: () => number;
    _status: StorageState<tree>;
};

/**
 * Create a storage for a specific type of tree
 */
export function Storage<tree>(): Storage<tree> {
    const storage: Storage<tree> = {
        open: (mode: OpenMode) => open(mode, storage),
        close: () => close(storage),
        save: (tree: tree, label: string, feedbackGiven: string[]) =>
            save(tree, label, feedbackGiven, storage),
        lookup: (id: number) => lookup(id, storage),
        search: (query: string) => search(query, storage),
        rowCount: () => rowCount(storage),
        _status: {
            mode: { kind: "in-memory" },
            status: { kind: "closed" },
            connection: { kind: "in-memory", rows: [] },
        },
    };

    return storage;
}
