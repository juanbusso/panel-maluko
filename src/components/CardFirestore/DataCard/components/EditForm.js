import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";
import ToggleButtonGroup from "@material-ui/lab/ToggleButtonGroup";
import ToggleButton from "@material-ui/lab/ToggleButton";
import InputUpload from "../../../Drive/UploadInput";
import TextField from "@material-ui/core/TextField";
import React, {useEffect, useMemo, useReducer, useState} from "react";
import {KeyboardDatePicker} from "@material-ui/pickers";
import {format as formatDate} from "date-fns";
import matchSorter from "match-sorter";
import {algoliaIndex} from "../../../../algolia";
import Autocomplete from "@material-ui/lab/Autocomplete";
import CircularProgress from "@material-ui/core/CircularProgress";
import {makeStyles} from "@material-ui/styles";
import {green} from "@material-ui/core/colors";
import customFieldRender from "../../../CustomField";
import AddNew from "./AddNew";
import {useRoleDataContext} from "../../../../context/RoleContext";

import Accordion from '@material-ui/core/Accordion';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

import merge from 'deepmerge';
import Button from "@material-ui/core/Button";

const useStyles = makeStyles((theme) => ({
    form: {
        "width":"-webkit-fill-available",
        '& > div': {
            margin: theme.spacing(1),
            width: '100%',
        },
    },
    text: {
        marginBottom: theme.spacing(1),
    },
    title: {
        textDecoration: 'underline',
    },
    toggleContainer: {
        margin: theme.spacing(1),
    },
    fileInput: {
        display: 'none',
    },
    buttonProgress: {
        color: green[500],
        position: 'absolute',
        top: '50%',
        left: '50%',
        marginTop: -12,
        marginLeft: -12,
    },
    buttonSuccess: {
        backgroundColor: green[500],
        '&:hover': {
            backgroundColor: green[700],
        },
    },
    accordionHeading: {
        fontSize: theme.typography.pxToRem(15),
        flexBasis: '33.33%',
        flexShrink: 0,
    },
    accordionSecondaryHeading: {
        fontSize: theme.typography.pxToRem(15),
        color: theme.palette.text.secondary,
    }
}));

export default function EditForm({fields,hit,update,orginalHit,transformBody}) {
    const classes = useStyles();

    // const [values, setValue] = useReducer((a, s) =>  s.n || merge(a,s.f.split('.').reverse().reduce((p,a)=>({[a]:p}),s.v)),  hit);
    // const values = nested ? hit[nested] || {} : hit;
    // const setValue = h=>console.log(h);

    // useEffect(() => {
    //     setValue({n: hit})
    // }, [hit]);

    return (<>
                <form className={classes.form}>
                    <Fields classes={classes} fields={fields} values={hit} update={update} setValue={(a)=>console.log(a)} orginalHit={orginalHit}/>
                </form>
            </>);
}

    function Fields({fields,values,update,transformBody,classes,setValue,hit,orginalHit}) {
        !hit && (hit=values);
        return (<>{
            fields
            .filter(f => !f.options || f.options.edit === undefined || (typeof f.options.edit === 'string' && customFieldRender(hit, f.options.edit)) || f.options.edit === true)
                .map(f => <Field key={f.field} orginalHit={orginalHit} f={f} hit={hit} classes={classes} update={update} transformBody={transformBody} values={values} setValue={setValue}/>
                )
        }</>)
    }

    function Field({f,values,update,transformBody,classes,setValue,hit,orginalHit}){


       return (f.options && (
                f.options.type === 'autocomplete' ?
                    <AutocompleteWhithOptions field={f} values={values[f.field] || false}
                                              onChange={v => update({field: f.field, value: v})}/> :
                    f.options.multiple ? <Multiple classes={classes} field={f} values={values} update={update} setValue={setValue} hit={hit} orginalHit={orginalHit}/> :
                        f.options.nested ? <Nested classes={classes} field={f} values={values} update={update} setValue={setValue} hit={hit} orginalHit={orginalHit}/> :
                            f.options.index ?
                            <Asynchronous hit={values}
                                          filters={f.options.index.filters || (f.options.index.customFilters && customFieldRender(hit, f.options.index.customFilters)) || ''}
                                          facetFilters={(f.options.index.facetFilters && JSON.parse(customFieldRender(hit,f.options.index.facetFilters))) || []}
                                          transformBody={(f.options.transformBody) || (transformBody && transformBody[f.field])}
                                          index={f.options.index.name} field={f.options.index.field}
                                          customText={f.options.index.customText}
                                          multiple={f.options.index.multiple} title={f.name}
                                          values={values[f.field] || false}
                                          onChange={v => update({field: f.field, value: v})}/>
                            :
                            (f.options.type === 'checkbox' && <FormControlLabel
                                                                                control={<Checkbox
                                                                                    checked={!!values[f.field]}
                                                                                    onChange={event => update({
                                                                                        field: f.field,
                                                                                        value: event.target.checked
                                                                                    })} name={f.name}/>}
                                                                                label={f.name}
                                                                                labelPlacement="start"
                            />) ||
                            (f.options.type === 'select' && !f.options.multiple &&
                                <div className={classes.toggleContainer}><ToggleButtonGroup
                                    color={"primary"} onChange={(e, v) => update({field: f.field, value: v})}
                                    exclusive value={values[f.field]} aria-label="primary">
                                    {Object.keys(f.options.options).map(o => <ToggleButton color={"primary"} key={o}
                                                                                           value={o}>{f.options.options[o]}</ToggleButton>)}
                                </ToggleButtonGroup></div>) ||
                            (f.options.type === 'file' &&
                                <InputUpload filename={values[f.field + '_name'] || (values[f.field] && values[f.field]['_name']) || (typeof values[f.field] === 'string' ?values[f.field]:'')}
                                             fileId={values[f.field]}
                                             accept={f.options.file && f.options.file.accept}
                                             folderId={f.options.file && customFieldRender(hit,f.options.file.folderId)}
                                             onUploaded={(v, filename) => update({
                                                 hit: {
                                                     [f.field]: v,
                                                     [f.field + '_name']: filename
                                                 }
                                             })} title={f.name}/>
                                             )
                            ||
                            (f.options.type === 'date' &&
                                <DatePicker value={values[f.field]} label={f.name}
                                            onChange={v => update({field: f.field, value: v})}/>)

        ))
        || React.createElement(FieldTextField,{f,values,update,transformBody,classes,setValue,hit,orginalHit})
    }

    function FieldTextField({f,values,update}){
    const [value,setValue] = useState(values[f.field]||'');
    useEffect(() => {
        setValue(values[f.field])
    }, [values[f.field]]);

    return (f.options && f.options.type === 'multiline' &&
        < TextField multiline label={f.name} type={'text'}
                    value={value || ''} onChange={e => setValue(
            f.options.type === 'number' ? e.target.value : e.target.value
        )} onKeyPress={e => e.key === 'Enter' && e.target.blur()}
                    onBlur={e => e.target.value !== value && update({
                        field: f.field,
                        value: f.options.type === 'number' ? Number(e.target.value) : e.target.value
                    })} rowsMax="4" variant="outlined"/>)
        ||
        ( < TextField multiline={!(f.options && f.options.type !== 'text')} label={f.name}
                      type={(f.options && f.options.type) || 'text'}
                      value={value || ''}
                      maxLength={(f.options && f.options.maxLength)}
                      InputProps={{maxLength: 2}}
                      onChange={e => setValue( f.options && f.options.type === 'number' ? f.options && f.options.maxLength ? Number(String(e.target.value).substring(0,f.options.maxLength)) : e.target.value : f.options && f.options.maxLength ? e.target.value.replace('\n', '').substring(0,f.options.maxLength) : e.target.value.replace('\n', '')
                      )} onKeyPress={e => e.key === 'Enter' && e.target.blur()}
                      onBlur={e => update({
                          field: f.field,
                          value: f.options && f.options.type === 'number' ? Number(e.target.value) : e.target.value.trim()
                      })} rowsMax="4" variant="outlined"/>
    )
    }

const randomColor = ()=> `hsl(${Math.floor(Math.random() * 360)}, 100%, ${Math.floor(Math.random() * 10)+80}%)`;

function Nested({field: nestedField,values,update,classes,setValue,hit,orginalHit}) {
    const color = useMemo(()=>randomColor(),[])

        return <>
            <Accordion>
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    style={{backgroundColor:color}}
                >
                    <Typography className={classes.accordionHeading}>{nestedField.name}</Typography>
                    <Typography className={classes.accordionSecondaryHeading}>Tocar para ampliar</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <div className={classes.form}>
                    <Fields classes={classes} orginalHit={orginalHit[nestedField.field]||{}} setValue={({f,v})=>setValue({f:nestedField.field+'.'+f,v})} nested={nestedField.field} fields={nestedField.options.nested} update={({field,hit,...r})=>update({...r,field:field && nestedField.field+'.'+field,...nestedHit(hit,nestedField.field)})} values={values[nestedField.field] || {}} hit={hit}/>
                    </div>
                </AccordionDetails>
            </Accordion>
            </>
}

function Multiple({field: nestedField,values,update,classes,setValue,hit,orginalHit}) {
    const [count,setCount] = useState((values[nestedField.field]||[]).length);

    return <>
        <Accordion>
            <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                style={{backgroundColor:randomColor()}}
            >
                <Typography className={classes&&classes.accordionHeading}>{nestedField.name}</Typography>
                <Typography className={classes&&classes.accordionSecondaryHeading}>Tocar para ampliar</Typography>
            </AccordionSummary>
            <AccordionDetails style={{display:'block'}}>
                <div className={classes&&classes.form}>
                    <Fields classes={classes} orginalHit={orginalHit[nestedField.field]||{}}
                            setValue={({f,v})=>setValue({f:nestedField.field+'.'+f,v})}
                            nested={nestedField.field}
                            fields={[...new Array(count)].map((a,i)=>({...nestedField,field:String(i),name:nestedField.name+' '+i,options:{...nestedField.options,multiple:false}}))}
                            update={({field,hit,value,...r})=>update(multipleHit(orginalHit,{...hit,...(field?{[field]:value}:{})},nestedField.field))}
                            values={values[nestedField.field] || []} hit={hit}/>
                </div>
                <div>
                <Button onClick={()=>setCount(i=>(i||0)+1)}> Mas 1 </Button>
                </div>
            </AccordionDetails>
        </Accordion>
    </>
}

function nestedHit(hit,nested) {
    let nhit = {};
    for (let i in hit) nhit[nested+'.'+i] = hit[i];
    return hit && Object.keys(hit).length ? {hit:nhit} : {};
}

function multipleHit(values,new_values,nested) {
    if(new_values) {
        let nhit = {};
        let number;
        for (let i in new_values) /^[0-9]+$/.test(i.split('.')[0]) && (number = i.split('.')[0]);
        // if (!new_values[number] && values[nested] && values[nested][number]) { values[nested].splice(number,1); return {hit:{[nested]:values[nested]}} }
        nhit[nested] = typeof values[nested] === 'object' ? values[nested] : [];
        // for (let j = 0; j <= number; j++) nhit[nested][j] === undefined && (nhit[nested][j] = {});
        !nhit[nested][number] && (nhit[nested][number] = {});
        for (let i in new_values) {
            let field = i === number ? 'value' : i.replace(number, '').replace(/\./g,'');
            nhit[nested][number][field] = new_values[i];
        }
        // for (let i in nhit[nested]) if(!nhit[nested][i]) nhit[nested].splice(i,1);
        return {hit: nhit};
    }
    return {}
}

function DatePicker({label,value,onChange}) {

    return  <KeyboardDatePicker
        margin="normal"
        label={label||"Date picker dialog"}
        inputVariant="outlined"
        format="dd/MM/yyyy"
        value={value?value+' GMT-1100':undefined}
        invalidDateMessage={'Formato de Fecha Inválido'}
        onChange={d=>d&&!isNaN(d.getTime())&&onChange&&onChange(formatDate(d, 'yyyy-MM-dd'))}
        InputAdornmentProps={{ position: "start" }}
        KeyboardButtonProps={{
            'aria-label': 'change date',
        }}
    />

}

function AutocompleteWhithOptions({field,values,onChange}) {
    let options = field.options.options;
    const [selected,setSelected] = useState( typeof values === 'string' ? options[values] && {title:options[values],objectID:values} : typeof values === 'object' && values[0] ? values.map(i=>({title:options[i],objectID:i})) : typeof values === 'object' && Object.keys(values) ? values.objectID ? values : Object.keys(values).map(h=>values[h]) : (field.options.multiple?[]:null));
    const [inputValue, setInputValue] = React.useState('');

    if (!options[0]) {
        let new_options = [];
        for (let i in options) new_options.push( {title:options[i],objectID:i} );
        options = new_options;
    }

    return (
            <Autocomplete
                value={selected}
                multiple={!!field.options.multiple}
                onChange={(event, newValue) => {
                    onChange && onChange(newValue && (newValue.objectID || newValue.map(v=>v.objectID)));
                    setSelected(newValue);
                }}
                inputValue={inputValue}
                getOptionSelected={(option, value) =>  option.objectID === value.objectID}
                getOptionLabel={(option) => option && option.title ? option.title : field.customField ? field.customField(option, field.customField) : option[field.options.field]}
                onInputChange={(event, newInputValue) => {
                    setInputValue(newInputValue);
                }}
                options={options}
                renderInput={(params) => <TextField {...params} label={field.name} variant="outlined" />}
            />
    );
}

function Asynchronous({index,field,transformBody,title,multiple,values,filters,onChange,customText,facetFilters}) {
    const [openDialogAddNew,setOpenDialogAddNew] = useState(false);
    const [open, setOpen] = useState(false);
    const [searchText,setSearchText] = useState('');
    // const [values,setValues] = useState('');
    const [selected,setSelected] = useState( typeof values === 'object' && Object.keys(values) ? values.objectID ? multiple ? [values] : values : Object.keys(values).map(h=>values[h]) : (multiple?[]:null));
    const [options, setOptions] = useReducer((o,a)=>{
        if(a==='reset') return {o:{},h:[]};
        for (let i in a) o.o[a[i].objectID] = a[i];
        o.h = Object.keys(o.o).map(h=>o.o[h]);
        o.h = matchSorter(o.h,searchText,{keys: o.h[0] && Object.keys(o.h[0])});
        if (multiple) for (let i in selected) {
            if (!o.h.find(h=>h.objectID===selected[i].objectID))
            {o.h.push(selected[i]); o.o[selected[i].objectID] = selected[i]};}
        else if (selected && selected.objectID && !o.h.find(h=>h.objectID===selected.objectID))
        {o.h.push(selected); o.o[selected.objectID] = selected};
        return {...o} },{o:{},h:[]});
    const loading = open && options.h.length === 0;



    const roleData = useRoleDataContext();

    useEffect(()=>{
        setOptions('reset');
    },[filters]);

    useEffect(()=>{
        setSelected(typeof values === 'object' && Object.keys(values) ? values.objectID ? values : Object.keys(values).map(h=>values[h]) : (multiple?[]:null))
    },[values,multiple]);

    React.useEffect(() => {
        let active = true;

        // if (!loading) {
        //     return undefined;
        // }

        (async () => {
            await sleep(loading ? 0 : 200 );
            if (active && ( searchText || loading ) && open) {
                var values = await algoliaIndex(index).search(searchText,{filters,facetFilters}).then(({hits})=>hits);
                setOptions(values);
            }
        })();

        return () => {
            active = false;
        };
    }, [loading,index,searchText,open,filters,facetFilters]);


    // React.useEffect(() => {
    //     if (!open) {
    //         setOptions([]);
    //     }
    // }, [open]);

    const filterOptions = (opt, { inputValue }) => {
        let h = Object.keys(options.o).map(h=>options.o[h]);
        sleep(100).then(()=>setSearchText(inputValue));
        let filtered = matchSorter(h,inputValue,{keys: h[0]&&Object.keys(h[0])});
        if ( roleData.new && roleData.new.includes(index) && inputValue !== '') {
            filtered.push({
                inputValue: inputValue,
                title: `Agregar "${inputValue}"`,
                addingNew: true,
            });
        }
        return filtered;
    }


    return ( <>
        {openDialogAddNew && <AddNew index={index}
                                     hit={{
                                         //campos por default
                                         ...(filters ? (()=> {
                                             let hit = {};
                                             let fs = filters.split(' AND ');
                                             for (let i in fs) if (!hit[fs[i].split(':')[0]]) hit[fs[i].split(':')[0]] = fs[i].split(':')[1];
                                             return hit;
                                         } )() : {}),
                                         ...(field ? {[field]:searchText} : {})
                                     }}
                                     open={openDialogAddNew} setOpen={setOpenDialogAddNew}
                                     onAdd={(id,hit)=>{
                                         hit.objectID = id;
                                         if (multiple) {
                                             onChange && onChange([...selected,hit].map(v=>v.objectID));
                                             setSelected([...selected,hit]);
                                         }
                                         else {
                                             onChange && onChange(id);
                                             setSelected(hit);
                                         }
                                     }}/>}
        <Autocomplete
            open={open}
            onOpen={() => {
                setOpen(true);
            }}
            onClose={() => {
                setOpen(false);
            }}
            multiple={!!multiple}
            getOptionSelected={(option, value) =>  option.objectID === value.objectID}
            getOptionLabel={(option) => option && option.title ? option.title : transformBody ? transformBody(option) : customText ? customFieldRender(option, customText) : option[field]}
            options={options.h}
            loading={loading}
            value={ selected }
            filterOptions={filterOptions}
            onChange={(event, newValue) => {
                if ( newValue && ( newValue.addingNew || ( newValue[0] && newValue.filter(v=>v.addingNew).length ) ) ) {
                    setOpenDialogAddNew(true);
                }
                else {
                    onChange && onChange(newValue && (newValue.objectID || newValue.map(v=>v.objectID)));
                    setSelected(newValue);
                }
            }}
            renderInput={(params) => (
                <TextField
                    {...params}
                    label={title}
                    variant="outlined"
                    InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                            <React.Fragment>
                                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                                {params.InputProps.endAdornment}
                            </React.Fragment>
                        ),
                    }}
                />
            )}
        /></>
    );


}


function sleep(delay = 0) {
    return new Promise((resolve) => {
        setTimeout(resolve, delay);
    });
}
