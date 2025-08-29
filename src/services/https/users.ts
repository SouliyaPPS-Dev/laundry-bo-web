import { IUsersListParam, IUsersListRes, UserDetailRes } from "models/users";
import { baseInstance } from "./axios_client";

export const getUserList = async ({
  queryParam,
  pagination,
}: IUsersListParam) => {
  const response = await baseInstance.get<IUsersListRes>('/api/v1/users', {
    params: {
      ...queryParam,
      ...pagination,
    },
  });
  return response.data;
};


export const getUserDetail = async (id: string) => {
  const response = await baseInstance.get<UserDetailRes>(`/api/v1/users/${id}`);
  return response.data;
};
