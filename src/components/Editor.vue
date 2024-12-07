<template>
    <div v-if="editor" class="container">
        <div class="control-group">
            <div class="button-group">
                <button
                    @click="
                        editor.chain().focus().toggleHeading({ level: 1 }).run()
                    "
                    :class="{
                        'is-active': editor.isActive('heading', { level: 1 })
                    }"
                >
                    H1
                </button>
                <button
                    @click="
                        editor.chain().focus().toggleHeading({ level: 2 }).run()
                    "
                    :class="{
                        'is-active': editor.isActive('heading', { level: 2 })
                    }"
                >
                    H2
                </button>
                <button
                    @click="
                        editor.chain().focus().toggleHeading({ level: 3 }).run()
                    "
                    :class="{
                        'is-active': editor.isActive('heading', { level: 3 })
                    }"
                >
                    H3
                </button>
                <button
                    @click="editor.chain().focus().setParagraph().run()"
                    :class="{ 'is-active': editor.isActive('paragraph') }"
                >
                    Paragraph
                </button>
                <button
                    @click="editor.chain().focus().toggleBold().run()"
                    :class="{ 'is-active': editor.isActive('bold') }"
                >
                    Bold
                </button>
                <button
                    @click="editor.chain().focus().toggleItalic().run()"
                    :class="{ 'is-active': editor.isActive('italic') }"
                >
                    Italic
                </button>
                <button
                    @click="editor.chain().focus().toggleStrike().run()"
                    :class="{ 'is-active': editor.isActive('strike') }"
                >
                    Strike
                </button>
                <button
                    @click="editor.chain().focus().toggleHighlight().run()"
                    :class="{ 'is-active': editor.isActive('highlight') }"
                >
                    Highlight
                </button>
                <button
                    @click="editor.chain().focus().setTextAlign('left').run()"
                    :class="{
                        'is-active': editor.isActive({ textAlign: 'left' })
                    }"
                >
                    Left
                </button>
                <button
                    @click="editor.chain().focus().setTextAlign('center').run()"
                    :class="{
                        'is-active': editor.isActive({ textAlign: 'center' })
                    }"
                >
                    Center
                </button>
                <button
                    @click="editor.chain().focus().setTextAlign('right').run()"
                    :class="{
                        'is-active': editor.isActive({ textAlign: 'right' })
                    }"
                >
                    Right
                </button>
                <button
                    @click="
                        editor.chain().focus().setTextAlign('justify').run()
                    "
                    :class="{
                        'is-active': editor.isActive({ textAlign: 'justify' })
                    }"
                >
                    Justify
                </button>
                <button @click="addImage">Add image from URL</button>
                <button @click="addVideo">Add video</button>
                <button @click="handleAcessToken">获取acessToken</button>
                <button @click="handleNew">创建草稿</button>
                <button @click="handleList">获取素材列表</button>
                <button @click="handleVideoList">获取视频素材列表</button>

                <button @click="handleContentHTML">测试转换html</button>
            </div>
        </div>
        <editor-content class="editwrap" :editor="editor" />
        <a-modal
            v-model:visible="draftConfirmModal"
            @cancel="handleCancel"
            :on-before-ok="handleOk"
            width="800px"
            @close="handleClose"
            unmountOnClose
        >
            <template #title> 请输入创建草稿信息 </template>
            <a-form :model="form" :style="{ width: '600px' }">
                <a-form-item
                    field="title"
                    tooltip="公众号文章标题"
                    label="标题"
                >
                    <a-input v-model="form.title" placeholder="请输入标题" />
                </a-form-item>
                <a-form-item
                    field="thumb_media_id"
                    tooltip="公众号封面图片素材"
                    label="封面"
                >
                    <a-upload
                        :custom-request="customRequest"
                        :show-file-list="false"
                    >
                        <template #upload-button>
                            <div :class="`arco-upload-list-item`">
                                <div
                                    class="arco-upload-list-picture custom-upload-avatar"
                                    v-if="
                                        form.thumb_media_id &&
                                        form.thumb_media_id.url
                                    "
                                >
                                    <img :src="form.thumb_media_id.local_url" />
                                    <div class="arco-upload-list-picture-mask">
                                        <IconEdit />
                                    </div>
                                </div>
                                <div class="arco-upload-picture-card" v-else>
                                    <div class="arco-upload-picture-card-text">
                                        <IconPlus />
                                        <div
                                            style="
                                                margin-top: 10px;
                                                font-weight: 600;
                                            "
                                        >
                                            Upload
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </template>
                    </a-upload>
                </a-form-item>
                <a-form-item field="digest" label="摘要">
                    <a-input
                        v-model="form.digest"
                        placeholder="请输入摘要，不输入系统默认截取内容"
                    />
                </a-form-item>
                <a-form-item field="content_source_url" label="文章原始地址">
                    <a-input
                        v-model="form.content_source_url"
                        placeholder="请输入文章原始地址"
                    />
                </a-form-item>
                <a-form-item field="need_open_comment" label="是否打开评论">
                    <a-switch v-model="form.need_open_comment" />
                </a-form-item>
                <a-form-item
                    field="only_fans_can_comment"
                    label="是否粉丝可评论"
                >
                    <a-switch v-model="form.only_fans_can_comment" />
                </a-form-item>
            </a-form>
        </a-modal>
    </div>
</template>

<script>
import Highlight from "@tiptap/extension-highlight";
import TextAlign from "@tiptap/extension-text-align";
import StarterKit from "@tiptap/starter-kit";
import Dropcursor from "@tiptap/extension-dropcursor";
import Image from "@tiptap/extension-image";
import Video from "../utils/video.js";
import { Editor, EditorContent } from "@tiptap/vue-3";
import {
    getAccseeToken,
    newDraft,
    getMediaList,
    uploadForeverImg,
    uploadImg,
    uploadForeverVideo
} from "../utils/http.js";
import cookies from "js-cookie";
import { h, ref } from "vue";
import { IconPlus, IconEdit } from "@arco-design/web-vue/es/icon";

export default {
    name: "Editor",
    props: [],
    components: {
        EditorContent,
        IconPlus,
        IconEdit
    },
    data() {
        return {
            editor: null,
            draftConfirmModal: false,
            form: {
                title: "",
                thumb_media_id: null,
                digest: "",
                content_source_url: "",
                need_open_comment: false,
                only_fans_can_comment: false
            }
        };
    },
    methods: {
        customRequest(option) {
            const { onProgress, onError, onSuccess, fileItem, name } = option;
            uploadForeverImg(fileItem)
                .then((res) => {
                    this.form.thumb_media_id = {
                        local_url: fileItem.url,
                        ...res.data
                    };
                    onSuccess(res);
                })
                .catch((err) => {
                    onError(err);
                });

            return {
                abort() {}
            };
        },
        getCustomIcon() {
            return {
                retryIcon: () => h(IconUpload)
            };
        },
        handleCancel() {
            debugger;
            this.draftConfirmModal = false;
        },
        handleClose() {
            this.form = {
                title: "",
                thumb_media_id: null,
                digest: "",
                content_source_url: "",
                need_open_comment: false,
                only_fans_can_comment: false
            };
        },
        async handleContentHTML() {
            //处理html数据，把其中的图片和视频替换为微信地址
            const contentHTML = this.editor.getHTML();
            const tempDiv = document.createElement("div");

            // 将HTML字符串设置为div的内容
            tempDiv.innerHTML = contentHTML;

            // 获取所有的img标签
            const images = tempDiv.getElementsByTagName("img");

            // 遍历所有的img标签并修改src属性
            for (let i = 0; i < images.length; i++) {
                const res = await uploadImg(images[i].src);
                let newSrc = res.data.url;
                console.log("newSrcnewSrc", newSrc);
                images[i].src = newSrc;
            }

            // 获取所有的img标签
            const videos = tempDiv.getElementsByTagName("video");

            // 遍历所有的img标签并修改src属性
            for (let i = 0; i < videos.length; i++) {
                // const res = await uploadForeverVideo(videos[i].src);
                // let newSrc = res.data.url;
                let video_iframe = document.createElement("iframe");
                video_iframe.class = "video_iframe rich_pages";
                video_iframe.style = "z-index:1;height:320px;height:320px;";
                video_iframe.setAttribute("data-vidtype", "2");
                video_iframe.setAttribute(
                    "data-mpvid",
                    "wxv_3756564470718464003"
                );

                video_iframe.setAttribute(
                    "data-cover",
                    "http://mmbiz.qpic.cn/mmbiz_jpg/Lib3JR4Nia7aohk9aqlC8hO1wbCjlzAeyUQH31Sp5FxmsKWmtRh6F5640SQ7YoKDyZDgmbHhD0uH86NcQ4wgypAA/0?wx_fmt=jpeg"
                );

                video_iframe.setAttribute("data-w", "1920");

                video_iframe.setAttribute(
                    "data-src",
                    "https://mp.weixin.qq.com/mp/readtemplate?t=pages/video_player_tmpl&amp;action=mpvideo&amp;auto=0&amp;vid=wxv_3756564470718464003"
                );

                videos[i].parentNode.replaceChild(video_iframe, videos[i]);
            }

            // 返回修改后的HTML字符串
            console.log("tempDiv.innerHTML", tempDiv.innerHTML);
            return tempDiv.innerHTML;
        },
        async handleOk() {
            if (this.form.title != "" && this.form.thumb_media_id != null) {
                let contentHTML = await this.handleContentHTML();
                newDraft({
                    articles: [
                        {
                            title: this.form.title,
                            author: "shiyang",
                            digest: this.form.digest,
                            thumb_media_id: this.form.thumb_media_id.media_id,
                            content: contentHTML,
                            need_open_comment: this.form.need_open_comment
                                ? 1
                                : 0,
                            only_fans_can_comment: this.form
                                .only_fans_can_comment
                                ? 1
                                : 0
                        }
                    ]
                })
                    .then((res) => {
                        console.log(res);
                        this.$message.success("发布成功");
                    })
                    .catch((err) => {
                        console.log(err);
                        this.$message.error("发布成功");
                    });
                this.draftConfirmModal = false;
            } else {
                this.$message.error("请输入标题和封面");
            }
            return true;
        },
        addImage() {
            const url = window.prompt("URL");

            if (url) {
                this.editor.chain().focus().setImage({ src: url }).run();
            }
        },
        addVideo() {
            const url = window.prompt("URL");

            if (url) {
                this.editor.chain().focus().setVideo({ src: url }).run();
            }
        },
        handleAcessToken() {
            getAccseeToken(
                "wxeb84c7cdb0b95d63",
                "ccbfba0d07524d29b73d37ce7d75480c"
            )
                .then((res) => {
                    console.log(res);
                    cookies.set("access_token", res.data.access_token, {
                        expires: res.data.expires_in
                    });
                })
                .catch((err) => {
                    console.log(err);
                });
        },
        handleNew() {
            //1. 获取资源列表展示选择预览头图
            this.draftConfirmModal = true;
        },
        handleList() {
            getMediaList({
                type: "image",
                offset: 0,
                count: 10
            }).then((res) => {
                console.log(res);
            });
        },
        handleVideoList() {
            getMediaList({
                type: "video",
                offset: 0,
                count: 10
            }).then((res) => {
                console.log(res);
            });
        }
    },

    mounted() {
        this.editor = new Editor({
            extensions: [
                StarterKit,
                TextAlign.configure({
                    types: ["heading", "paragraph"]
                }),
                Highlight,
                Image,
                Dropcursor,
                Video
            ],
            content:
                '<h3 style="text-align: center">Devs Just Want to Have Fun by Cyndi Lauper</h3><p style="text-align: center">I come home in the morning light<br>My mother says, <mark>“When you gonna live your life right?”</mark><br>Oh mother dear we’re not the fortunate ones<br>And devs, they wanna have fun<br>Oh devs just want to have fun</p><div class="video-wrapper"><video src="./110076114.mp4" controls="true"></video></div><img src="./red.png"><p style="text-align: center">The phone rings in the middle of the night<br>My father yells, "What you gonna do with your life?"<br>Oh daddy dear, you know you’re still number one<br>But <s>girls</s>devs, they wanna have fun<br>Oh devs just want to have</p><p style="text-align: center">That’s all they really want<br>Some fun<br>When the working day is done<br>Oh devs, they wanna have fun<br>Oh devs just wanna have fun<br>(devs, they wanna, wanna have fun, devs wanna have)</p>'
        });
        //https://t.pimg.jp/mp4/110/076/114/1/110076114.mp4
        //https://www.jnnews.tv/a/10001/202412/81a9089a1f004655f2713f39a281f3e8.jpeg
        window.editor = this.editor;
    },
    beforeUnmount() {
        this.editor.destroy();
    }
};
</script>

<style scoped>
.editwrap {
    display: flex;
    justify-content: center;
    height: 500px;
    overflow: scroll;
}
</style>

<style lang="scss">
.tiptap {
    outline: none;
    width: 375px;
    img {
        max-width: 100%;
    }
    video {
        max-width: 100%;
    }
}
</style>
