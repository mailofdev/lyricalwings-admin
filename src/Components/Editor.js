import React, { useState } from 'react';

const Editor = () => {

    const [text, setText] = useState("");

    return (
        <div>
            <Editor value={text} onTextChange={(e) => setText(e.htmlValue)} style={{ height: '100px' }} />

        </div>
    );
}

export default Editor;
