import React, { useMemo, useState } from 'react';
import { Modal, Upload } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import axios from 'axios';

import { RcCustomRequestOptions } from 'antd/lib/upload/interface';
import { IUpload } from 'types';
import { useTypedSelector } from 'store';

type Props = {
  isVisible: boolean;
  onClose: () => void;
  onOk: (uploads: IUpload[]) => void;
};

const UploadFile: React.FC<Props> = ({ isVisible, onClose, onOk }) => {
  const token = useTypedSelector((state) => state.user.token);

  const [uploads, setUploads] = useState<IUpload[]>([]);

  const photos = useMemo(() => {
    return uploads.map((photo) => ({
      uid: photo._id,
      name: photo.filename,
      size: 50,
      type: photo.mimetype as string,
      url: photo.path,
    }));
  }, [uploads]);

  const uploadFile = async (fileInfo: RcCustomRequestOptions) => {
    console.log('args', fileInfo);

    const file = fileInfo.file;
    const data = new FormData();
    data.append('file', file);

    var reader = new FileReader();

    //Read the contents of Image File.
    reader.readAsDataURL(file);

    reader.onload = function (e) {
      //Initiate the JavaScript Image object.
      var image = new Image();

      //Set the Base64 string return from FileReader as source.
      image.src = e.target!.result as string;

      //Validate the File Height and Width.
      image.onload = function () {
        // @ts-ignore
        var height = this.height;
        // @ts-ignore
        var width = this.width;
        console.log('height withd', width, height);
      };
    };

    try {
      const response = (
        await axios({
          method: 'post',
          url: process.env.REACT_APP_FILE_URL,
          data,
          headers: { Authorization: `Bearer ${token}` },
        })
      ).data[0];

      setUploads((v) => [...v, response]);
      console.log('resp', response);
    } catch (e) {
      console.error('error in uploading', e);
    }
  };

  const onCloseModal = () => {
    setUploads([]);
    onClose();
  };

  const onSendPhoto = () => {
    setUploads([]);
    onOk(uploads);
  };

  return (
    <Modal
      visible={isVisible}
      onCancel={onCloseModal}
      onOk={() => onSendPhoto()}
      okText="Отправить"
      cancelText="Отменить"
      centered
      destroyOnClose
    >
      <Upload
        customRequest={uploadFile}
        listType="picture-card"
        fileList={photos}
        onChange={(arg) => console.log('file', arg)}
      >
        {uploads.length >= 4 ? null : (
          <div>
            <PlusOutlined />
            <div style={{ marginTop: 8 }}>Загрузить</div>
          </div>
        )}
      </Upload>
    </Modal>
  );
};

export default UploadFile;
