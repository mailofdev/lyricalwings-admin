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
                label: 'content',
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
            },
            {
                type: 'text',
                name: 'facebook',
                label: 'Facebook',
            },
            {
                type: 'text',
                name: 'instagram',
                label: 'Instagram',
            },
            {
                type: 'text',
                name: 'linkedin',
                label: 'LinkedIn',
            },
            {
                type: 'text',
                name: 'contactNo',
                label: 'Contact No.',
            },
            ]
        }
    ],
    aboutUs: [
        {
            fields: [
                {
                    type: 'editor',
                    name: 'content',
                    label: 'Content',
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
                },

                {
                    type: 'text',
                    name: 'facebook',
                    label: 'Facebook',
                },
                {
                    type: 'text',
                    name: 'instagram',
                    label: 'Instagram',
                },
                {
                    type: 'text',
                    name: 'linkedin',
                    label: 'LinkedIn',
                },
                {
                    type: 'text',
                    name: 'contactNo',
                    label: 'Contact No.',
                },
                {
                    type: 'text',
                    name: 'address',
                    label: 'Address',
                },
            ]
        }
    ]
};

export const authConfig = {
    SignIn: [
        {
            fields: [
                {
                    type: 'email',
                    name: 'email',
                    label: 'Email',
                    placeholder: 'Enter your email',
                },
                {
                    type: 'password',
                    name: 'password',
                    label: 'Password',
                    placeholder: 'Enter your password',
                }
            ]
        }
    ],
    SignUp: [
        {
            fields: [
                {
                    type: 'email',
                    name: 'email',
                    label: 'Email',
                    placeholder: 'Enter your email',
                },
                {
                    type: 'password',
                    name: 'password',
                    label: 'Password',
                    placeholder: 'Create a password (min 6 characters)',
                },
                {
                    type: 'text',
                    name: 'username',
                    label: 'Username',
                    placeholder: 'Enter your username',
                },
                {
                    type: 'date',
                    name: 'birthdate',
                    label: 'Birth Date',
                },
                {
                    type: 'text',
                    name: 'city',
                    label: 'City',
                    placeholder: 'Enter your city',
                },
                {
                    type: 'text',
                    name: 'country',
                    label: 'Country',
                    placeholder: 'Enter your country',
                },
                {
                    type: 'dropdown',
                    name: 'gender',
                    label: 'Gender',
                    options: [
                        { label: 'Male', value: 'male' },
                        { label: 'Female', value: 'female' },
                        { label: 'Other', value: 'other' },
                    ],
                    placeholder: 'Select your gender'
                }
            ]
        }
    ]
};

export const poemConfig = [{
    fields: [
        { type: 'input', name: 'title', label: 'Title' },
        {
            type: 'editor',
            name: 'htmlSubtitle',
            label: 'Subtitle',
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
        },
        {
            type: 'editor',
            name: 'htmlContent',
            label: 'Content',
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
        },
        {
            type: 'dropdown',
            name: 'type',
            label: 'Select Type',
            options: [
                { label: 'Happiness', value: 'Happiness' },
                { label: 'Sadness', value: 'Sadness' },
                { label: 'Anger', value: 'Anger' },
                { label: 'Fear', value: 'Fear' },
                { label: 'Disgust', value: 'Disgust' },
                { label: 'Surprise', value: 'Surprise' }
            ]
        }
    ]
}
];

export const narrativeConfig = [ {
    fields: [
        { type: 'input', name: 'title', label: 'Title' },
        {
            type: 'editor',
            name: 'htmlContent',
            label: 'Content',
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
        },
        {
            type: 'dropdown',
            name: 'type',
            label: 'Select Type',
            options: [
                { label: 'Story', value: 'Story' },
                { label: 'Novel', value: 'Novel' },
            ]
        }
    ]
}];

export const courseConfig = [{
    fields: [
        { type: 'text', name: 'titleOfType', label: 'Title of type' },
        { type: 'textarea', name: 'introductionOfType', label: 'Introduction of type' },
        { type: 'textarea', name: 'structureOfType', label: 'Structure of type' },
        { type: 'file', name: 'structureFileURL', label: 'Upload file of structure' },
        { type: 'textarea', name: 'literatureOfType', label: 'Literature of type' },
        { type: 'file', name: 'literatureFileURL', label: 'Upload file of literature' },
        { type: 'textarea', name: 'methodologyOfType', label: 'Methodology of type' },
        { type: 'file', name: 'methodologyFileURL', label: 'Upload file of methodology' },
        { type: 'textarea', name: 'evalutionOfType', label: 'Evaluation of type' },
        { type: 'file', name: 'evalutionFileURL', label: 'Upload file of evalution' },
        { type: 'textarea', name: 'conclusionOfType', label: 'Conclusion of type' },
        { type: 'file', name: 'conclusionFileURL', label: 'Upload file of conclusion' },
    ]
}];