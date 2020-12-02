import React from "react";
import { JSONEditor } from "@json-editor/json-editor";

export default function ({schema={},value={},onSubmit}) {

    const [rendered,setRendered] = React.useState(false);

    const handleClick = (e) => {
        if (!rendered){
        var editor;
        setRendered(true);
        let el = e.target;
         el.innerHTML = '';
        editor = new JSONEditor(el,{
            schema,
            startval:value,
            theme:'bootstrap4',
            iconlib:'fontawesome4',
        });
        let b = document.createElement("button");
        b.innerText = 'Confirmar';
        b.onclick = () => typeof onSubmit === 'function' && onSubmit(editor.getValue());
        el.insertAdjacentElement("afterend",b);
    }}

    return <><div onClick={handleClick}>Editar</div>
        {/*<button onClick={()=>console.log(editor.getValue())}>Submit</button>*/}
        </>

}
