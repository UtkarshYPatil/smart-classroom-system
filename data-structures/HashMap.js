class HashMap {
    constructor(size = 100) {
        this.buckets = new Array(size);
        this.bucketSize = size;
        this.count = 0;
    }
    
    hash(key) {
        // Convert key to string to handle numeric keys
        const keyStr = String(key);
        let hash = 0;
        for (let i = 0; i < keyStr.length; i++) {
            hash = (hash + keyStr.charCodeAt(i) * i) % this.bucketSize;
        }
        return hash;
    }
    
    set(key, value) {
        const keyStr = String(key);
        const index = this.hash(keyStr);
        
        if (!this.buckets[index]) {
            this.buckets[index] = [];
        }
        
        const bucket = this.buckets[index];
        
        // Check if key already exists and update
        for (let i = 0; i < bucket.length; i++) {
            if (bucket[i][0] === keyStr) {
                bucket[i][1] = value;
                return;
            }
        }
        
        // Add new key-value pair
        bucket.push([keyStr, value]);
        this.count++;
    }
    
    get(key) {
        const keyStr = String(key);
        const index = this.hash(keyStr);
        const bucket = this.buckets[index];
        
        if (!bucket) return null;
        
        for (let i = 0; i < bucket.length; i++) {
            if (bucket[i][0] === keyStr) {
                return bucket[i][1];
            }
        }
        return null;
    }
    
    delete(key) {
        const keyStr = String(key);
        const index = this.hash(keyStr);
        const bucket = this.buckets[index];
        
        if (!bucket) return false;
        
        for (let i = 0; i < bucket.length; i++) {
            if (bucket[i][0] === keyStr) {
                bucket.splice(i, 1);
                this.count--;
                return true;
            }
        }
        return false;
    }
    
    has(key) {
        const keyStr = String(key);
        const index = this.hash(keyStr);
        const bucket = this.buckets[index];
        
        if (!bucket) return false;
        
        for (let i = 0; i < bucket.length; i++) {
            if (bucket[i][0] === keyStr) {
                return true;
            }
        }
        return false;
    }
    
    keys() {
        const allKeys = [];
        for (let i = 0; i < this.buckets.length; i++) {
            if (this.buckets[i]) {
                for (let j = 0; j < this.buckets[i].length; j++) {
                    allKeys.push(this.buckets[i][j][0]);
                }
            }
        }
        return allKeys;
    }
    
    values() {
        const allValues = [];
        for (let i = 0; i < this.buckets.length; i++) {
            if (this.buckets[i]) {
                for (let j = 0; j < this.buckets[i].length; j++) {
                    allValues.push(this.buckets[i][j][1]);
                }
            }
        }
        return allValues;
    }
    
    entries() {
        const allEntries = [];
        for (let i = 0; i < this.buckets.length; i++) {
            if (this.buckets[i]) {
                for (let j = 0; j < this.buckets[i].length; j++) {
                    allEntries.push([this.buckets[i][j][0], this.buckets[i][j][1]]);
                }
            }
        }
        return allEntries;
    }
    
    size() {
        return this.count;
    }
    
    isEmpty() {
        return this.count === 0;
    }
    
    clear() {
        this.buckets = new Array(this.bucketSize);
        this.count = 0;
    }
}

module.exports = HashMap;
