import { configureStore } from "@reduxjs/toolkit";
import authSlice from "./authSlice";

const store = configureStore({
  reducer: {
    auth: authSlice,
    // post: postSlice,
    //TODO: add more slices here for posts 17:00 ep 27
  },
});

export default store;
