
import Cookies from "js-cookie";
import { createSlice } from "@reduxjs/toolkit";

const storedUser = Cookies.get("user");
const initialState = storedUser ? JSON.parse(storedUser) : {
  userId: '',
  roleId: '',
  roleName: '',
  accessToken: '',
  refreshToken: '',
  fullname: '',
  avatar: '',
}

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUserRedux: (state, action) => {
      state.userId = action.payload.userId;
      state.roleId = action.payload.roleId;
      state.roleName = action.payload.roleName;
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.fullname = action.payload.fullname;
      state.avatar = action.payload.avatar;
    },
    logout: (state) => {
      state.userId = "";
      state.roleId = "";
      state.roleName = "";
      state.accessToken = "";
      state.refreshToken = "";
      state.fullname = "";
      state.avatar = "";
      Cookies.remove("user");
    },
  }
});

export const { setUserRedux, logout } = userSlice.actions;
export default userSlice.reducer;