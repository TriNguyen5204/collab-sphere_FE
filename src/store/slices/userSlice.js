
import Cookies from "js-cookie";
import { createSlice } from "@reduxjs/toolkit";
import { clearAllAppStorage, STORAGE_KEYS } from "../../utils/storageUtils";

const storedUser = Cookies.get(STORAGE_KEYS.USER);
const initialState = storedUser ? JSON.parse(storedUser) : {
  userId: '',
  fullName: '',
  roleId: '',
  roleName: '',
  accessToken: '',
  refreshToken: '',
  fullname: '',
  avatar: '',
  refreshTokenExpiryTime: '',
}

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUserRedux: (state, action) => {
      state.userId = Number(action.payload.userId);
      state.fullName = action.payload.fullName;
      state.roleId = action.payload.roleId;
      state.roleName = action.payload.roleName;
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.avatar = action.payload.avatar;
      state.refreshTokenExpiryTime = action.payload.refreshTokenExpiryTime;
    },
    logout: (state) => {
      state.userId = "";
      state.fullName = "";
      state.roleId = "";
      state.roleName = "";
      state.accessToken = "";
      state.refreshToken = "";
      state.avatar = "";
      state.refreshTokenExpiryTime = "";
      clearAllAppStorage();
    },
  }
});

export const { setUserRedux, logout } = userSlice.actions;
export default userSlice.reducer;