/* 
 * Database logic using Dexie.js
 * Stores: 
 * - notes: canvas dataURLs for persistence
 * - form_queue: pending contact form submissions
 */
const db = new Dexie("AgisalesPWA");

db.version(1).stores({
    notes: "id, dataURL, timestamp", // id will be 'current_notes' or similar
    form_queue: "++id, data, url, timestamp"
});

const DB = {
    async saveNotes(dataURL) {
        return await db.notes.put({
            id: 'current_notes',
            dataURL: dataURL,
            timestamp: Date.now()
        });
    },

    async loadNotes() {
        const entry = await db.notes.get('current_notes');
        return entry ? entry.dataURL : null;
    },

    async queueForm(data, url) {
        return await db.form_queue.add({
            data: data,
            url: url,
            timestamp: Date.now()
        });
    },

    async getQueue() {
        return await db.form_queue.toArray();
    },

    async removeFromQueue(id) {
        return await db.form_queue.delete(id);
    }
};
