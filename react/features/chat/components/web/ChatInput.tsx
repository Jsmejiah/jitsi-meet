import React, { Component, RefObject } from 'react';
import { WithTranslation } from 'react-i18next';
import { connect } from 'react-redux';

import { IReduxState, IStore } from '../../../app/types';
import { isMobileBrowser } from '../../../base/environment/utils';
import { translate } from '../../../base/i18n/functions';
import { IconFaceSmile, IconSend } from '../../../base/icons/svg';
import Button from '../../../base/ui/components/web/Button';
import Input from '../../../base/ui/components/web/Input';
import { areSmileysDisabled } from '../../functions';

import SmileysPanel from './SmileysPanel';

/**
 * The type of the React {@code Component} props of {@link ChatInput}.
 */
interface IProps extends WithTranslation {

    /**
     * Whether chat emoticons are disabled.
     */
    _areSmileysDisabled: boolean;

    /**
     * Invoked to send chat messages.
     */
    dispatch: IStore['dispatch'];

    /**
     * Callback to invoke on message send.
     */
    onSend: Function;
}

/**
 * The type of the React {@code Component} state of {@link ChatInput}.
 */
interface IState {

    /**
     * User provided nickname when the input text is provided in the view.
     */
    message: string;

    /**
     * Whether or not the smiley selector is visible.
     */
    showSmileysPanel: boolean;

    /**
     *  File object for the document to be sent.
     */
    file: File | null;
}

/**
 * Implements a React Component for drafting and submitting a chat message.
 *
 * @augments Component
 */
class ChatInput extends Component<IProps, IState> {
    _textArea?: RefObject<HTMLTextAreaElement>;
    fileInputRef: React.RefObject<HTMLInputElement>;

    state = {
        message: '',
        showSmileysPanel: false,
        file: null as File | null
    };

    /**
     * Initializes a new {@code ChatInput} instance.
     *
     * @param {Object} props - The read-only properties with which the new
     * instance is to be initialized.
     */
    constructor(props: IProps) {
        super(props);

        this._textArea = React.createRef<HTMLTextAreaElement>();

        // Bind event handlers so they are only bound once for every instance.
        this._onDetectSubmit = this._onDetectSubmit.bind(this);
        this._onMessageChange = this._onMessageChange.bind(this);
        this._onSmileySelect = this._onSmileySelect.bind(this);
        this._onSubmitMessage = this._onSubmitMessage.bind(this);
        this._toggleSmileysPanel = this._toggleSmileysPanel.bind(this);
        this.fileInputRef = React.createRef<HTMLInputElement>();
    }

    /**
     * Implements React's {@link Component#componentDidMount()}.
     *
     * @inheritdoc
     */
    componentDidMount() {
        if (isMobileBrowser()) {
            // Ensure textarea is not focused when opening chat on mobile browser.
            this._textArea?.current && this._textArea.current.blur();
        } else {
            this._focus();
        }
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        return (
            <div className = { `chat-input-container${this.state.message.trim().length ? ' populated' : ''}` }>
                <div id = 'chat-input' >
                    {!this.props._areSmileysDisabled && this.state.showSmileysPanel && (
                        <div
                            className = 'smiley-input'>
                            <div
                                className = 'smileys-panel' >
                                <SmileysPanel
                                    onSmileySelect = { this._onSmileySelect } />
                            </div>
                        </div>
                    )}
                    <Input
                        className = 'chat-input'
                        icon = { this.props._areSmileysDisabled ? undefined : IconFaceSmile }
                        iconClick = { this._toggleSmileysPanel }
                        maxRows = { 5 }
                        onChange = { this._onMessageChange }
                        onKeyPress = { this._onDetectSubmit }
                        placeholder = { this.props.t('chat.messagebox') }
                        ref = { this._textArea }
                        textarea = { true }
                        value = { this.state.message } />
                    <Button
                        accessibilityLabel = { this.props.t('chat.sendButton') }
                        disabled = { !this.state.message.trim() }
                        icon = { IconSend }
                        onClick = { this._onSubmitMessage }
                        size = { isMobileBrowser() ? 'large' : 'medium' } />
                    <input type="file" ref={this.fileInputRef} onChange={this.handleFileChange} />
                </div>
            </div>
        );
    }

    /**
     * Place cursor focus on this component's text area.
     *
     * @private
     * @returns {void}
     */
    _focus() {
        this._textArea?.current && this._textArea.current.focus();
    }

    handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0] || null;
        this.setState({ file: selectedFile });
      };

    /**
     * Submits the message to the chat window.
     *
     * @returns {void}
     */
    _onSubmitMessage() {
        const { message, file } = this.state;
      
        // Perform file upload logic here
        if (file) {
          const formData = new FormData();
          formData.append('file', file);
      
          // Send the file to the server
          
          //fetch('https://192.168.0.21:8002/api/hello', {
          //  method: 'GET'
          //})
          //console.log('enviando...')
          //fetch('https://192.168.0.21:8002/api/upload', {
          //  method: 'POST',
          //  body: formData
          //})
          //  .then(response => response.json())
          //  .then(data => {
                console.log('enviado...')
          //    console.log(data);
              const fileRoute = '/var/www/uploads/'+file.name;
      
              // Update the message to be the route of the uploaded file
              //Añadir un codigo para diferenciar los archivos de los mensajes
              const updatedMessage = fileRoute;
      
              // Send the updated message to the chat window
              this.props.onSend(updatedMessage);
      
              // Clear the input fields
              this.setState({ message: '', file: null });
      
              // Keep the textarea in focus when sending messages via submit button
              this._focus();
         //   })
         //   .catch(error => {
         //     console.error('Error uploading file:', error);
         //   });
        } else {
          // No file selected, send the message as it is
          this.props.onSend(message);
      
          // Clear the input fields
          this.setState({ message: '' });
      
          // Keep the textarea in focus when sending messages via submit button
          this._focus();
        }
      }

    /**
     * Detects if enter has been pressed. If so, submit the message in the chat
     * window.
     *
     * @param {string} event - Keyboard event.
     * @private
     * @returns {void}
     */
    _onDetectSubmit(event: any) {
        // Composition events used to add accents to characters
        // despite their absence from standard US keyboards,
        // to build up logograms of many Asian languages
        // from their base components or categories and so on.
        if (event.isComposing || event.keyCode === 229) {
            // keyCode 229 means that user pressed some button,
            // but input method is still processing that.
            // This is a standard behavior for some input methods
            // like entering japanese or сhinese hieroglyphs.
            return;
        }

        if (event.key === 'Enter'
            && event.shiftKey === false
            && event.ctrlKey === false) {
            event.preventDefault();
            event.stopPropagation();

            this._onSubmitMessage();
        }
    }

    /**
     * Updates the known message the user is drafting.
     *
     * @param {string} value - Keyboard event.
     * @private
     * @returns {void}
     */
    _onMessageChange(value: string) {
        this.setState({ message: value });
    }

    /**
     * Appends a selected smileys to the chat message draft.
     *
     * @param {string} smileyText - The value of the smiley to append to the
     * chat message.
     * @private
     * @returns {void}
     */
    _onSmileySelect(smileyText: string) {
        if (smileyText) {
            this.setState({
                message: `${this.state.message} ${smileyText}`,
                showSmileysPanel: false
            });
        } else {
            this.setState({
                showSmileysPanel: false
            });
        }

        this._focus();
    }

    /**
     * Callback invoked to hide or show the smileys selector.
     *
     * @private
     * @returns {void}
     */
    _toggleSmileysPanel() {
        if (this.state.showSmileysPanel) {
            this._focus();
        }
        this.setState({ showSmileysPanel: !this.state.showSmileysPanel });
    }
}

/**
 * Function that maps parts of Redux state tree into component props.
 *
 * @param {Object} state - Redux state.
 * @private
 * @returns {{
 *     _areSmileysDisabled: boolean
 * }}
 */
const mapStateToProps = (state: IReduxState) => {
    return {
        _areSmileysDisabled: areSmileysDisabled(state)
    };
};

export default translate(connect(mapStateToProps)(ChatInput));
