import { Node } from "@tiptap/core";

export default Node.create({
    name: "video",

    group: "block",

    atom: true,

    addOptions() {
        return {
            HTMLAttributes: {
                class: "video-wrapper"
            }
        };
    },

    addAttributes() {
        return {
            src: {
                default: null
            },
            controls: {
                default: true
            }
        };
    },

    parseHTML() {
        return [
            {
                tag: "video"
            }
        ];
    },

    renderHTML({ HTMLAttributes }) {
        return ["div", this.options.HTMLAttributes, ["video", HTMLAttributes]];
    },

    addCommands() {
        return {
            setVideo:
                (options) =>
                ({ tr, dispatch }) => {
                    const { selection } = tr;
                    const node = this.type.create(options);
                    if (dispatch) {
                        tr.replaceRangeWith(selection.from, selection.to, node);
                    }

                    return true;
                }
        };
    }
});
