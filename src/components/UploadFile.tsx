import React, { useMemo, useState } from 'react';
import { Modal, Upload } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import axios from 'axios';

import { getToken } from 'utils';

import { RcCustomRequestOptions } from 'antd/lib/upload/interface';
import { IUpload } from 'types';

type Props = {
  isVisible: boolean;
  onClose: () => void;
  onOk: (uploads: IUpload[]) => void;
};

const UploadFile: React.FC<Props> = ({ isVisible, onClose, onOk }) => {
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
    const token = getToken();

    const file = fileInfo.file;
    const data = new FormData();
    data.append('file', file);

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
