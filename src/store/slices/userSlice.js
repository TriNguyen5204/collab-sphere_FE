
import Cookies from "js-cookie";
import { createSlice } from "@reduxjs/toolkit";

const storedUser = Cookies.get("user");
const initialState = storedUser ? JSON.parse(storedUser) : {
  userId: '',
  fullName: '',
  roleId: '',
  roleName: '',
  accessToken: '',
  refreshToken: '',
  refreshTokenExpiryTime: '',
}

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUserRedux: (state, action) => {
      state.userId = action.payload.userId;
      state.fullName = action.payload.fullName;
      state.roleId = action.payload.roleId;
      state.roleName = action.payload.roleName;
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.refreshTokenExpiryTime = action.payload.refreshTokenExpiryTime;
    },
    logout: (state) => {
      state.userId = "";
      state.fullName = "";
      state.roleId = "";
      state.roleName = "";
      state.accessToken = "";
      state.refreshToken = "";
      state.refreshTokenExpiryTime = "";
      Cookies.remove("user");
    },
  }
});

export const { setUserRedux, logout } = userSlice.actions;
export default userSlice.reducer;