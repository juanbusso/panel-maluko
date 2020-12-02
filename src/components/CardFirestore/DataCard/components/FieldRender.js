import customField from "../../../CustomField";
import * as Icons from "@material-ui/icons";
import DriveFileViewButtonModal, {DriveFilePrintButton} from "../../../Drive/Modal";
import {format as formatDate} from "date-fns";
import React, {useMemo} from "react";
import {useAreaDataContext} from "../../../../context/AreaContext";
import {Link} from "react-router-dom";
import {Button} from "../../../Wrappers";
import {updateDoc} from "../../../../firebase";
import IconButton from "@material-ui/core/IconButton";
import {useSnackbar} from "notistack";
import Accordion from "@material-ui/core/Accordion";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import Typography from "@material-ui/core/Typography";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import {filterToDisplay} from "../DataCard";


export default function FieldRender({f,values,hit,transformBody,index,classes})  {
     !hit && (hit=values||{});
     !values && (values=hit||{});
    return <> {
            f.options && (f.options.multiple) ? <Multiple field={f} hit={hit} values={values} index={index} classes={classes}/> :
            f.options && f.options.nested ? <Nested field={f} values={values} hit={hit} index={index} classes={classes}/> :
            f.options && f.options.type === 'checkbox'?values[f.field]?<Icons.Check />:<Icons.Clear />:
            f.options && f.options.type === 'file' ? (()=>{
                let fileID = values[f.field];
                if (!fileID) for(let af in f.alternativeFields) { fileID = hit[f.alternativeFields[af]]; if(fileID) break; }
                    return fileID && <><DriveFileViewButtonModal driveFileId={(fileID && fileID.value)||fileID}/>
                <DriveFilePrintButton driveFileId={fileID}/>
                </> })() :
                f.options && f.options.type === 'button' ? <ButtonField hit={values} f={f} index={index}/> :
                values[f.field] && (
                ( f.options && f.options.type === 'select' && f.options.options[values[f.field]] ) ||
                ( f.options && f.options.index
                        ?
                        ( values[f.field].objectID && transformBodyText(f,transformBody,values[f.field],f.options.index.field,hit,values,classes)) || Object.keys(values[f.field]).map((h,i)=><span key={i}>{transformBodyText(f,transformBody,values[f.field][h],f.options.index.field,hit,values,classes)}{i!==Object.keys(values[f.field]).length-1 && '; '}</span>)
                        :
                        f.options && f.options.type === 'date' ?  formatDate(new Date(((values[f.field]['_seconds'] || values[f.field]['seconds']) || 0 ) * 1000 || values[f.field].replace(/-/g, '/')+' GMT-1100'), 'dd/MM/yyyy'+((values[f.field]['_seconds'] || values[f.field]['seconds'])?' H:mm':'')) :

                            typeof values[f.field] === 'object' ? Object.keys(values[f.field]).map((h,i)=><span key={i}>{values[f.field][h]}{i < (Object.keys(values[f.field]).length -1) && '; '}</span>) :
                            typeof values[f.field] === 'string' || typeof values[f.field] === 'number' ?
                                transformBodyText(f,transformBody,values[f.field],'',hit)
                                : ''
                ))}
        {f.options && f.options.afterText && customField(hit,f.options.afterText)}
                </>
}

const randomColor = ()=> `hsl(${Math.floor(Math.random() * 360)}, 100%, ${Math.floor(Math.random() * 10)+80}%)`;//'#'+Math.floor(Math.random()*16777215).toString(16);



function Nested({field,hit,index,classes,values}) {
    const color = useMemo(()=>randomColor(),[]);

    return <>
        <Accordion style={{backgroundColor:color}}>
            <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
            >
                <Typography>{field.name}</Typography>
                {/*<Typography className={classes.accordionSecondaryHeading}>Tocar para ampliar</Typography>*/}
            </AccordionSummary>
            <AccordionDetails style={{display:'block'}}>
                {   filterToDisplay(field.options.nested,hit)
                    .map(f=>
                        <div  key={f.field} className={classes && classes.text}>
                            {f.name && (!f.options || !f.options.multiple) ? <><span className={classes && classes.name}>{f.name}</span>: </>: ''}
                            <FieldRender f={f} values={values[field.field] || {}} index={index} classes={classes} hit={hit}/>
                        </div>
                    )}
            </AccordionDetails>
        </Accordion>
    </>
}


function Multiple({field: nestedField,hit,index,classes,values}) {

    let fields = [...new Array((values[nestedField.field]||[]).length)].map((a,i)=>({...nestedField,field:String(i),name:nestedField.name+' '+i,options:{...nestedField.options,multiple:false,...(nestedField.options.index?{index:{...nestedField.options.index,multiple:false}}:{})}}));


    return !fields ? '' : fields.length === 1 ? <div className={classes && classes.text}>
        {nestedField.name && !(nestedField.options && nestedField.options.nested) && <><span className={classes.name}>{nestedField.name}</span>: </>}
        <FieldRender f={{...fields[0],name:nestedField.name}} values={values[nestedField.field] || {}} index={index} classes={classes} hit={hit}/>
    </div> : <>
        <Accordion style={{backgroundColor:randomColor()}}>
            <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
            >
                <Typography>{nestedField.name}</Typography>
                {/*<Typography className={classes.accordionSecondaryHeading}>Tocar para ampliar</Typography>*/}
            </AccordionSummary>
            <AccordionDetails style={{display:'block'}}>
                {   fields.map(f=>
                        <div key={f.field} className={classes && classes.text}>
                                <FieldRender f={f} values={values[nestedField.field] || {}} index={index} classes={classes} hit={hit}/>
                        </div>
                    )}
            </AccordionDetails>
        </Accordion>
    </>
}

function ButtonField({hit,f,index}) {
    const { enqueueSnackbar } = useSnackbar();

    const update = ({field,value,...r}) => {
        const nhit = r.hit;
        !field && (field=Object.keys(nhit)[0]);
        let ohit = {[field]:hit[field] === undefined ? '' : typeof hit[field] !== 'object' ? hit[field] : hit[field].objectID || Object.keys(hit[field])};
        if (nhit) for (let f in nhit) ohit[f] = hit[f] === undefined ? '' : typeof hit[f] !== 'object' ? hit[f] : hit[f].objectID || Object.keys(hit[f]);
        updateDoc({indexName:index,id:hit.objectID,hit:nhit||{[field]:value}}).then(()=>enqueueSnackbar(field === 'delete'? 'Documento Borrado' :(field)+' actualizado.',{
            action:
                <React.Fragment>
                    { field !== 'delete' && <Button color="secondary" size="small" onClick={()=>updateDoc({indexName:index,id:hit.objectID,hit:ohit})}>
                        DESHACER
                    </Button> }
                    <IconButton size="small" aria-label="close" color="inherit">
                        {/*<CloseIcon fontSize="small" />*/}
                    </IconButton>
                </React.Fragment>

        }));
    }

    const noPointer = {cursor: 'default'};


    const ButtonFieldRender = ({button}) => <Button
        size="small"
        variant="contained"
        color={button.color ? customField(hit, button.color) : ''}
        // disabled={button.edit && !customField(hit,button.edit)}
        style={button.edit && !customField(hit,button.edit) ? noPointer : {}}
        onClick={()=>{
            if ( !button.edit || customField(hit,button.edit)) {
                button.action && update({
                    field: customField(hit, button.action.field),
                    value: customField(hit, button.action.value)
                });
                if (button.actions) {
                    let nhit = {};
                    for (let i in button.actions) nhit[customField(hit, button.actions[i].field)] = customField(hit, button.actions[i].value);
                    update({hit: nhit});
                }
            }}}
    >{ button.label ? customField(hit,button.label) : f.name}{(()=>!customField(hit,button.label)&&console.log(hit))()}</Button>;

    if (f.options.button)
    return <ButtonFieldRender button={f.options.button}/>;
    if (f.options.buttons) return f.options.buttons.filter(b=>!b.display || customField(hit,b.display)).map((b,i)=><ButtonFieldRender key={i} button={b}/>);

        }

function transformBodyText(f,transformBody,value,indexField,hit,values,classes) {
    let r = f.options && f.options.transformBody ?
        f.options.transformBody(value) :
        transformBody && transformBody[f.field] ?
            transformBody[f.field](value) :
            f && f.customField ? customField(hit, f.customField) :
                f.options && f.options.index && f.options.index.customText ? customField(value, f.options.index.customText) :
            typeof value === 'object' ? value[indexField] : value;
    return <>{f.options && f.options.index ? <RedirectToIndexCard f={f} value={value}>{r}</RedirectToIndexCard> : r}
    {f.options && f.options.index && f.options.index.secondField && FieldRender({f:f.options.index.secondField,values:value,hit:value,index:f.options.index.name,classes})}
    </>
}


function RedirectToIndexCard({f,children,value,onChange}) {

    const areaData = useAreaDataContext();

    if ( areaData.panel[f.options.index.name] )
        return <Link to={`/app/${f.options.index.name}/${value.objectID||value}`}>{children}</Link>
    else return children;
}
