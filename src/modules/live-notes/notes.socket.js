const Note = require('./note.model'); // We will create this next

module.exports = (io) => {
  const notesNamespace = io.of('/notes'); // Create a dedicated channel

  notesNamespace.on('connection', (socket) => {
    console.log(`🔌 New client connected: ${socket.id}`);

    // 1. Join a specific "Room" (The 6-digit code)
    socket.on('join_room', async (roomCode) => {
      socket.join(roomCode);
      console.log(`User ${socket.id} joined room: ${roomCode}`);

      // Load existing note from DB and send it to user
      try {
        let note = await Note.findOne({ code: roomCode });
        if (note) {
          socket.emit('load_note', note.content);
        }
      } catch (err) {
        console.error("Error loading note:", err);
      }
    });

    // 2. Handle Typing (Sync Text)
    socket.on('send_text', async ({ roomCode, content }) => {
      // Broadcast to everyone ELSE in the room
      socket.to(roomCode).emit('receive_text', content);

      // (Optional) Save to DB with "Debounce"
      // We don't save every keystroke to DB, only the final result
      // For now, let's just update it:
      await Note.findOneAndUpdate(
        { code: roomCode }, 
        { content: content },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    });

    socket.on('disconnect', () => {
      console.log('User disconnected');
    });
  });
};