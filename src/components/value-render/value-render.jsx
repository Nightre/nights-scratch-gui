import React, { useState } from "react"
import styles from "./value-render.css"
import classNames from 'classnames';
import funcIcon from "./func_icon.svg"

const ValueString = ({ value }) => {
    return <p className={styles.text}>{value}</p>
}
const ValueBoolean = ({ value }) => {
    return <p className={styles.text}> <input type="checkbox" checked={value} readOnly /> {value ? "true" : "false"}</p>
}
const ValueList = ({ value }) => {
    const [open, setOpen] = useState()
    return <div className={styles.list}>
        <p className={classNames(styles.text, styles.key)}>{"["}</p>
        {
            open ? value.map((subValue, index) =>
                <div key={index} className={styles.objectRow}>
                    <ValueRender value={subValue} />
                    <p className={classNames(styles.text, styles.key)}>,</p>
                </div>
            ) : <button onClick={() => setOpen(true)} >...</button>
        }
        <p className={classNames(styles.text, styles.key)}>{"]"}</p>
    </div>
}
const ValueObject = ({ value }) => {
    const [open, setOpen] = useState()
    return <div>
        <p className={classNames(styles.text, styles.key)}>{"{"}</p>
        {open ? <div style={{ "marginLeft": "1rem" }}>
            {
                Object.entries(value).map((subValue) =>
                    <div key={subValue[0]} className={styles.objectRow}>
                        <p className={classNames(styles.text, styles.key)}> {subValue[0]}:</p><ValueRender value={subValue[1]} />
                    </div>
                )
            }
        </div> : <button onClick={() => setOpen(true)} >...</button>}
        <p className={classNames(styles.text, styles.key)}>{"}"}</p>
    </div>
}
const ValueRender = ({ value }) => {
    if (typeof value == "string" || typeof value == "number" || typeof value == "bigint") {
        return <ValueString value={value} />
    }
    if (typeof value == "boolean") {
        return <ValueBoolean value={value} />
    }
    if (value instanceof Array) {
        return <ValueList value={value} />
    } else if (typeof value == "object" && value != null) {
        return <ValueObject value={value} />
    } else if (false) {
        return <>
            <img src={funcIcon} />
            <p className={classNames(styles.text, styles.key)}>{value.funcName.split("%")[0].trim() || " Function"}</p>
        </>
    } else {
        return "NULL"
    }
}

export default ValueRender