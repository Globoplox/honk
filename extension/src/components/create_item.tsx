import Api from '../api'
import './search_result_item.scss'
import Form from 'react-bootstrap/Form'
import Accordion from 'react-bootstrap/Accordion'
import { ChangeEvent, FormEvent, KeyboardEvent, useState } from "react";
import { Row, Col, Container, Stack, Button, Alert } from 'react-bootstrap';

export default function CreateItem({api}: {api: Api}) {    
    const [name, setName] = useState('')
    const [tags, setTags] = useState('')
    const [data, setData] = useState('')
    const [nameError, setNameError] = useState(null)
    const [tagsError, setTagsError] = useState(null)
    const [dataError, setDataError] = useState(null)
    const [submitSuccess, setSubmitSuccess] = useState(false)
    const [submitFailure, setSubmitFailure] = useState(null)

    function testName(name: string): boolean {
        return true
    }

    function testTags(tags: string): boolean {
        return true
    }

    function testData(data: string): boolean {
        return true
    }

    function onNameChange(e: ChangeEvent<HTMLInputElement>) {
        setName(e.target.value)
        testName(e.target.value)
    }
    
    function onTagsChange(e: ChangeEvent<HTMLInputElement>) {
        setTags(e.target.value)
        testTags(e.target.value)
    }
    
    function onDataChange(e: ChangeEvent<HTMLInputElement>) {
        setData(e.target.value)
        testData(e.target.value)
    }

    function onSubmit(e: FormEvent) {
        e.preventDefault()
        api.create(name, tags.split(' '), data).then(
            () => { setSubmitSuccess(true) },
            (error) => { setSubmitFailure(error.details)}
        )
    }

    return (
        <Container>
        <Form onSubmit={onSubmit}>
        <Form.Group>
            <Form.Label>Name</Form.Label>
            <Form.Control
                type="text" 
                value={name} 
                onChange={onNameChange}
                isInvalid={nameError !== null}
                className="form-control"
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
                className="form-control"
            />
            <Form.Control.Feedback type="invalid">
                {tagsError}
            </Form.Control.Feedback>
        </Form.Group>

        <Form.Group>
            <Form.Label>Data</Form.Label>
            <Form.Control 
                type="text" 
                value={data} 
                onChange={onDataChange}
                isInvalid={dataError !== null}
                className="form-control"
                placeholder="Search"
            />
            <Form.Control.Feedback type="invalid">
                {dataError}
            </Form.Control.Feedback>
        </Form.Group>

        <Button 
            variant='primary' 
            type='submit' 
            disabled={!(nameError === null && tagsError === null && dataError === null && name.length > 0 && data.length > 0)}
        >
            Create
        </Button>

        <Alert 
            show={submitFailure !== null} 
            onClose={() => setSubmitFailure(null)}
            variant='danger'
            dismissible
        >
            <Alert.Heading>
                Password creation failed!
            </Alert.Heading>
            <p>{submitFailure}</p>
        </Alert>

        <Alert 
            show={submitSuccess === true} 
            onClose={() => setSubmitSuccess(false)}
            variant='success'
            dismissible
        >
            <Alert.Heading>
                Successfully created the password
            </Alert.Heading>
        </Alert>

        </Form>

        </Container>
    );
};