"use strict";

module.exports = class MemoryLogbook {
    constructor(path) {
        this.data = {};
    }

    getRepositoryObject(repository) {
        if (!this.data[repository]) {
            this.data[repository] = {};
        }
        return this.data[repository];
    }

    get(repository, key, defaultValue) {
        let value = this.getRepositoryObject(repository)[key];
        return value === undefined ? defaultValue : value;
    }

    set(repository, key, value) {
        this.getRepositoryObject(repository)[key] = value;
    }
}
