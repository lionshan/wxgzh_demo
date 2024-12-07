import axios from "axios";
import cookies from "js-cookie";

const axiosCreate = {
    timeout: 30000,
    withCredentials: true // 是否允许后端设置cookie跨域，一般无需改动
};
const http = axios.create(axiosCreate);

http.interceptors.request.use(
    (config) => {
        return config;
    },
    (err) => Promise.reject(err)
);

http.interceptors.response.use(
    (response) => {
        if (response.data.code === 200) {
            return response;
        } else if (response.data.code === 2001) {
            return response;
        } else {
            return response;
        }
    },
    (error) => {
        return Promise.reject(error);
    }
);

export const getAccseeToken = (appId, appsecret) => {
    return http({
        url: `/cgi-bin/token?grant_type=client_credential&appid=${appId}&secret=${appsecret}`,
        method: "GET"
    });
};

export const newDraft = (data) => {
    return http({
        params: {
            access_token: cookies.get("access_token")
        },
        url: `/cgi-bin/draft/add`,
        data: data,
        method: "POST"
    });
};

export const getMediaList = (data) => {
    return http({
        params: {
            access_token: cookies.get("access_token")
        },
        url: `/cgi-bin/material/batchget_material`,
        data: data,
        method: "POST"
    });
};

export const uploadForeverImg = (file) => {
    const file_name = file.name;
    const formData = new FormData();

    formData.append("media", file.file, file_name);

    return http({
        params: {
            access_token: cookies.get("access_token"),
            type: "image"
        },
        url: `/cgi-bin/material/add_material`,
        data: formData,
        method: "POST"
    });
};

export const uploadImg = async (imgurl) => {
    const response = await http({
        url: imgurl,
        method: "GET",
        timeout: 0,
        responseType: "blob"
    });
    // 创建一个File对象
    const file = new File(
        [response.data],
        `img${parseInt(Math.random() * 10000)}`,
        {
            type: response.data.type,
            lastModified: Date.now()
        }
    );

    const file_name = file.name + file.type == "image/png" ? ".png" : ".jpg";
    const formData = new FormData();

    formData.append("media", file, file_name);
    return http({
        params: {
            access_token: cookies.get("access_token")
        },
        url: `/cgi-bin/media/uploadimg`,
        data: formData,
        method: "POST"
    });
};

export const uploadForeverVideo = async (videourl) => {
    const response = await http({
        url: videourl,
        method: "GET",
        timeout: 0,
        responseType: "blob"
    });
    // 创建一个File对象
    const file = new File(
        [response.data],
        `video${parseInt(Math.random() * 10000)}`,
        {
            type: response.data.type,
            lastModified: Date.now()
        }
    );

    const file_name = file.name + ".mp4";
    const formData = new FormData();
    let json = {
        title: "这是我的测试视频" + file_name,
        introduction: "这是我的测试视频这是我的测试视频这是我的测试视频"
    };
    formData.append("description", JSON.stringify(json));
    formData.append("media", file, file_name);

    return http({
        params: {
            access_token: cookies.get("access_token"),
            type: "video"
        },
        url: `/cgi-bin/material/add_material`,
        data: formData,
        method: "POST"
    });
};
