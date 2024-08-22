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
            {type: 'input',
            name: 'facebook', 
            label: 'Facebook',
            },
            {type: 'input',
            name: 'instagram', 
            label: 'Instagram',
            },
            {type: 'input',
            name: 'linkedin', 
            label: 'LinkedIn',
            },
            {type: 'input',
            name: 'contactNo', 
            label: 'Contact No.',
            },
        ]
        }
    ],
    aboutUs: [
        { fields: [
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

        {type: 'input',
        name: 'facebook', 
        label: 'Facebook',
        },
        {type: 'input',
        name: 'instagram', 
        label: 'Instagram',
        },
        {type: 'input',
        name: 'linkedin', 
        label: 'LinkedIn',
        },
        {type: 'input',
        name: 'contactNo', 
        label: 'Contact No.',
        },
        {type: 'input',
        name: 'address', 
        label: 'Address',
        },
    ] }
    ]
};

export const authConfig = {
    SignIn: [
        {
            fields: [
                {
                    type: 'input',
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
                    type: 'input',
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
                    type: 'input',
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
                    type: 'input',
                    name: 'city',
                    label: 'City',
                    placeholder: 'Enter your city',
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
