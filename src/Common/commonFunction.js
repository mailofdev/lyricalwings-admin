import DOMPurify from 'dompurify';

export const sanitizeHTML = (html) => {
    return { __html: DOMPurify.sanitize(html) };
};

export const aboutConfig = {
    aboutMe: [
        {
            fields: [{
                type: 'editor',
                name: 'content',
                label: '', 
                config: {
                    readonly: false,
                    placeholder: 'Start typing...',
                    autofocus: true,
                    uploader: { insertImageAsBase64URI: true },
                    disablePlugins: "video,about,ai-assistant,clean-html,delete-command,iframe,mobile,powered-by-jodit,source,speech-recognize,xpath,wrap-nodes,spellcheck,file",
                    buttons: "bold,italic,underline,strikethrough,eraser,ul,ol,font,fontsize,paragraph,lineHeight,image,preview,align",
                    askBeforePasteHTML: false,
                    askBeforePasteFromWord: false,
                    defaultActionOnPaste: "insert_only_text",
                }
            }]
        }
    ],
    aboutUs: [
        { fields: [{ 
            type: 'editor', 
            name: 'content', 
            label: '',
            config: {
                readonly: false,
                placeholder: 'Start typing...',
                autofocus: true,
                uploader: { insertImageAsBase64URI: true },
                disablePlugins: "video,about,ai-assistant,clean-html,delete-command,iframe,mobile,powered-by-jodit,source,speech-recognize,xpath,wrap-nodes,spellcheck,file",
                buttons: "bold,italic,underline,strikethrough,eraser,ul,ol,font,fontsize,paragraph,lineHeight,image,preview,align",
                askBeforePasteHTML: false,
                askBeforePasteFromWord: false,
                defaultActionOnPaste: "insert_only_text",
            }
        }] }
    ]
};
