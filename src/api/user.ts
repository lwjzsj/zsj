import { UrlApi } from "@/config/url";
import axios from "@/utils/axios";
import md5 from "js-md5";
import { LoginUser } from "./model/user";
export function login(
  phoneNumber: string,
  password: string,
  email?: string,
  areaCode?: string
) {
  const data = {
    areaCode: areaCode,
    phoneNumber: phoneNumber,
    email: email,
    password: md5(password),
    platform: 5,
  };
  return axios.post<LoginUser>(UrlApi.login, data);
}
