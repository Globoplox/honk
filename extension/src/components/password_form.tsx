import Api, {Password} from '../api'
import './search_result_item.scss'
import Form from 'react-bootstrap/Form'
import { ChangeEvent, MutableRefObject, useState, useRef, useEffect } from "react";
import { Container, Stack, Button, Alert } from 'react-bootstrap';

export default function PasswordForm(
    {api, password, onDelete, onNameUpdate, onTagsUpdate}: 
    {api: Api, password: Password, onDelete: () => void, onNameUpdate: (name: string) => void, onTagsUpdate: (tags: string) => void}
) {
    const [name, setName] = useState(password?.name || '')
    const [tags, setTags] = useState(password?.tags?.join(' ') || '')
    const [data, setData] = useState('')
    const [nameError, setNameError] = useState(null)
    const [tagsError, setTagsError] = useState(null)
    const [dataError, setDataError] = useState(null)
    const [submitSuccess, setSubmitSuccess] = useState(null)
    const [submitFailure, setSubmitFailure] = useState(null)
    const [updateEnbaled, setUpdateEnabled] = useState(false)
    const nameDelay : MutableRefObject<ReturnType<typeof setTimeout>> = useRef(null)
    const tagsDelay : MutableRefObject<ReturnType<typeof setTimeout>> = useRef(null)
    const dataDelay : MutableRefObject<ReturnType<typeof setTimeout>> = useRef(null)

    // reset must a state holding a function, and that is set when the alert is displayed 

    if (password)
        useEffect(() => {password.deciphered.then(setData)}, [])

    function testName(name: string): boolean {
        if (name.length < 3) {
            setNameError('Name must be at least 3 characters long')
            return false
        }
        if (name.length > 200) {
            setNameError('Name must be at most 200 characters long')
            return false
        }
        setNameError(null)
        return true
    }

    function testTags(tags: string): boolean {
        tags.trim().split(' ').map(tag => tag.trim()).filter(i => i).forEach(tag => {
            if (tag.length > 40) {
                setTagsError('Tags must be at most 40 characters long')
                return false    
            }
        })
        setTagsError(null)
        return true
    }

    function testData(data: string): boolean {
        if (data.length == 0) {
            setDataError("Data must not be empty")
            return false
        }
        setDataError(null)
        return true
    }

    function onNameChange(e: ChangeEvent<HTMLInputElement>) {
        setName(e.target.value)
        if (onNameUpdate)
            onNameUpdate(e.target.value)
        if (nameDelay.current !== null)
            clearTimeout(nameDelay.current)
        nameDelay.current = setTimeout(() => testName(e.target.value), 350)
        setUpdateEnabled(true)
    }
    
    function onTagsChange(e: ChangeEvent<HTMLInputElement>) {
        setTags(e.target.value)
        if (onTagsUpdate)
            onTagsUpdate(e.target.value.trim().split(' ').map(tag => tag.trim()).filter(i => i).join(' '))
        if (tagsDelay.current !== null)
            clearTimeout(tagsDelay.current)
        tagsDelay.current = setTimeout(() => testTags(e.target.value), 350)
        setUpdateEnabled(true)
    }
    
    function onDataChange(e: ChangeEvent<HTMLInputElement>) {
        setData(e.target.value)
        if (dataDelay.current !== null)
            clearTimeout(dataDelay.current)
        dataDelay.current = setTimeout(() => testData(e.target.value), 350)
        setUpdateEnabled(true)
    }

    function doCreate() {
        api.create(name, tags.trim().split(' ').map(tag => tag.trim()).filter(i => i), data).then(
            () => { setSubmitSuccess("Password successfully created") },
            (error) => { setSubmitFailure(error.details)}
        )
    }

    function doUpdate() {
        setUpdateEnabled(false)
        api.update(password.id, name, tags.trim().split(' ').map(tag => tag.trim()).filter(i => i), data).then(
            () => { setSubmitSuccess("Password successfully updated") },
            (error) => { setSubmitFailure(error.details)}
        )
    }

    function doDelete() {
        api.delete(password.id).then(
            () => { 
                setSubmitSuccess("Password successfully deleted")
                if (onDelete) {
                    setTimeout(onDelete, 1000)
                }
            },
            (error) => { setSubmitFailure(error.details)}
        )
    }

    function onCloseAlert() {
        if (password === null) {
            setName('')
            setTags('')
            setData('')
            setNameError(null)
            setTagsError(null)
            setDataError(null)
        }
        setSubmitSuccess(null)
        setSubmitFailure(null)
    }

    return (
        <Container>
        <Form>
        <Form.Group>
            <Form.Label>Name</Form.Label>
            <Form.Control
                type="text" 
                value={name} 
                onChange={onNameChange}
                isInvalid={nameError !== null}
                placeholder='A significant name'
            />
            <Form.Control.Feedback type="invalid">
                {nameError}
            </Form.Control.Feedback>
        </Form.Group>

        <Form.Group>
            <Form.Label>Tags</Form.Label>
            <Form.Control
                type="text" 
                value={tags} 
                onChange={onTagsChange}
                isInvalid={tagsError !== null}
                placeholder="tag note work"
            />
            <Form.Control.Feedback type="invalid">
                {tagsError}
            </Form.Control.Feedback>
        </Form.Group>

        <Form.Group className='mb-2'>
            <Form.Label>Data</Form.Label>
            <Form.Control 
                value={data} 
                onChange={onDataChange}
                isInvalid={dataError !== null}
                as='textarea'
                rows={3}
                placeholder="Your private data"
            />
            <Form.Control.Feedback type="invalid">
                {dataError}
            </Form.Control.Feedback>
        </Form.Group>

        <Form.Group className='mb-2'>
            <Stack direction="horizontal" gap={2}>

                <Button
                    hidden={password !== null}
                    variant='outline-primary'
                    onClick={doCreate}
                    disabled={!(nameError === null && tagsError === null && dataError === null && name.length > 0 && data.length > 0)}
                >
                    Create
                </Button>

                <Button
                    hidden={password === null}
                    variant='outline-primary'
                    onClick={doUpdate}
                    disabled={!updateEnbaled || !(nameError === null && tagsError === null && dataError === null && name.length > 0 && data.length > 0)}
                >
                    Update
                </Button>

                <Button
                    hidden={password === null}
                    variant='outline-primary'
                    onClick={doDelete}
                >
                    Delete
                </Button>

            </Stack>
        </Form.Group>

        <Alert 
            show={submitFailure !== null} 
            onClose={() => setSubmitFailure(null)}
            variant='danger'
            dismissible
        >
            <Alert.Heading>
                Submission failed!
            </Alert.Heading>
            <p>{submitFailure}</p>
        </Alert>

        <Alert 
            show={submitSuccess !== null} 
            onClose={onCloseAlert}
            variant='success'
            dismissible
        >
            {submitSuccess}
        </Alert>

        </Form>

        </Container>
    );
};

PasswordForm.defaultProps = {
    password: null,
    onDelete: null,
    onNameUpdate: null,
    onTagsUpdate: null
}