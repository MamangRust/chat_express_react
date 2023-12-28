import { create } from 'zustand';
import ChatService from '../services/chatService';

export const useChatStore = create((set) => ({
  chats: [],
  currentChat: {},
  socket: {},
  newMessage: { chatId: null, seen: null },
  scrollBottom: 0,
  senderTyping: { typing: false },
  fetchChats: async () => {
    try {
      const data = await ChatService.fetchChats();
      const modifiedData = data.map((chat) => {
        chat.Users.forEach((user) => {
          user.status = 'offline';
        });
        chat.Messages.reverse();
        return chat;
      });
      set({ chats: modifiedData });
      return data;
    } catch (err) {
      throw err;
    }
  },
  setCurrentChat: (chat) =>
    set((state) => ({
      currentChat: chat,
      scrollBottom: state.scrollBottom + 1,
      newMessage: { chatId: null, seen: null },
    })),
  onlineFriends: (friends) => {
    set((state) => {
      const updatedChats = state.chats.map((chat) => ({
        ...chat,
        Users: chat.Users.map((user) => ({
          ...user,
          status: friends.includes(user.id) ? 'online' : user.status,
        })),
      }));

      return { chats: updatedChats };
    });
  },
  friendOnline: (friend) => {
    set((state) => {
      const updatedChats = state.chats.map((chat) => {
        const updatedUsers = chat.Users.map((user) => {
          if (user.id === parseInt(friend.id)) {
            return { ...user, status: 'online' };
          }
          return user;
        });

        return {
          ...chat,
          Users: updatedUsers,
        };
      });

      let updatedCurrentChat = { ...state.currentChat };
      if (updatedCurrentChat.id === friend.currentChatId) {
        const updatedCurrentChatUsers = updatedCurrentChat.Users.map((user) => {
          if (user.id === parseInt(friend.id)) {
            return { ...user, status: 'online' };
          }
          return user;
        });

        updatedCurrentChat = {
          ...updatedCurrentChat,
          Users: updatedCurrentChatUsers,
        };
      }

      return {
        chats: updatedChats,
        currentChat: updatedCurrentChat,
      };
    });
  },
  friendOffline: (friend) => {
    set((state) => {
      const updatedChats = state.chats.map((chat) => {
        const updatedUsers = chat.Users.map((user) => {
          if (user.id === parseInt(friend.id)) {
            return { ...user, status: 'offline' };
          }
          return user;
        });

        return {
          ...chat,
          Users: updatedUsers,
        };
      });

      let updatedCurrentChat = { ...state.currentChat };
      if (updatedCurrentChat.id === friend.currentChatId) {
        const updatedCurrentChatUsers = updatedCurrentChat.Users.map((user) => {
          if (user.id === parseInt(friend.id)) {
            return { ...user, status: 'offline' };
          }
          return user;
        });

        updatedCurrentChat = {
          ...updatedCurrentChat,
          Users: updatedCurrentChatUsers,
        };
      }

      return {
        chats: updatedChats,
        currentChat: updatedCurrentChat,
      };
    });
  },
  setSocket: (socket) => {
    set({ socket });
  },
  receivedMessage: (payload) => {
    set((state) => {
      const { userId, message } = payload;
      let currentChatCopy = { ...state.currentChat };
      let newMessage = { ...state.newMessage };
      let scrollBottom = state.scrollBottom;

      const updatedChats = state.chats.map((chat) => {
        if (message.chatId === chat.id) {
          if (message.User.id === userId) {
            scrollBottom++;
          } else {
            newMessage = {
              chatId: chat.id,
              seen: false,
            };
          }

          if (message.chatId === currentChatCopy.id) {
            currentChatCopy = {
              ...currentChatCopy,
              Messages: [...currentChatCopy.Messages, message],
            };
          }

          return {
            ...chat,
            Messages: [...chat.Messages, message],
          };
        }
        return chat;
      });

      return {
        chats: updatedChats,
        currentChat: currentChatCopy,
        newMessage,
        scrollBottom:
          scrollBottom === state.scrollBottom
            ? state.scrollBottom
            : scrollBottom,
        senderTyping: { typing: false },
      };
    });
  },
  senderTypingFunction: (payload) => {
    set((state) => ({
      ...state,
      senderTyping: payload,
      scrollBottom: payload.typing
        ? state.scrollBottom + 1
        : state.scrollBottom,
    }));
  },
  paginateMessages: (payload) => {
    set((state) => {
      const { messages, id, pagination } = payload;
      let currentChatCopy = { ...state.currentChat };

      const updatedChats = state.chats.map((chat) => {
        if (chat.id === id) {
          const shifted = [...messages, ...chat.Messages];

          currentChatCopy = {
            ...currentChatCopy,
            Messages: shifted,
            Pagination: pagination,
          };

          return {
            ...chat,
            Messages: shifted,
            Pagination: pagination,
          };
        }

        return chat;
      });

      return {
        ...state,
        chats: updatedChats,
        currentChat: currentChatCopy,
      };
    });
  },
  incrementScroll: () => {
    set((state) => ({
      ...state,
      scrollBottom: state.scrollBottom + 1,
      newMessage: { chatId: null, seen: true },
    }));
  },
  createChat: (chat) => {
    set((state) => ({
      ...state,
      chats: [...state.chats, chat],
    }));
  },
  addUserToGroup: (payload) => {
    set((state) => {
      const { chat, chatters } = payload;
      let exists = false;

      const updatedChats = state.chats.map((chatState) => {
        if (chat.id === chatState.id) {
          exists = true;
          return {
            ...chatState,
            Users: [...chatState.Users, ...chatters],
          };
        }
        return chatState;
      });

      if (!exists) {
        updatedChats.push(chat);
      }

      let currentChatCopy = { ...state.currentChat };
      if (
        Object.keys(currentChatCopy).length > 0 &&
        chat.id === currentChatCopy.id
      ) {
        currentChatCopy = {
          ...currentChatCopy,
          Users: [...currentChatCopy.Users, ...chatters],
        };
      }

      return {
        ...state,
        chats: updatedChats,
        currentChat: currentChatCopy,
      };
    });
  },
  leaveCurrentChat: (payload) => {
    set((state) => {
      const { chatId, userId, currentUserId } = payload;

      if (userId === currentUserId) {
        const updatedChats = state.chats.filter((chat) => chat.id !== chatId);

        return {
          ...state,
          chats: updatedChats,
          currentChat: state.currentChat.id === chatId ? {} : state.currentChat,
        };
      }

      const updatedChats = state.chats.map((chat) => {
        if (chatId === chat.id) {
          return {
            ...chat,
            Users: chat.Users.filter((user) => user.id !== userId),
          };
        }
        return chat;
      });

      let currentChatCopy = { ...state.currentChat };
      if (currentChatCopy.id === chatId) {
        currentChatCopy = {
          ...currentChatCopy,
          Users: currentChatCopy.Users.filter((user) => user.id !== userId),
        };
      }

      return {
        ...state,
        chats: updatedChats,
        currentChat: currentChatCopy,
      };
    });
  },
  deleteCurrentChat: (chatId) => {
    set((state) => ({
      ...state,
      chats: state.chats.filter((chat) => chat.id !== chatId),
      currentChat: state.currentChat.id === chatId ? {} : state.currentChat,
    }));
  },
}));
