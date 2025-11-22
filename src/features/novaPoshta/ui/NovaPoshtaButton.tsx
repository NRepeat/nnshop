'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import styles from './NovaPoshtaButton.module.css';
import type { SelectedDepartment, NovaPoshtaButtonProps } from '../model/types';

export default function NovaPoshtaButton({
  onDepartmentSelect,
  className = '',
  initialText = '',
  initialDescription = 'Обрати відділення або поштомат',
}: NovaPoshtaButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedText, setSelectedText] = useState(initialText);
  const [selectedDepartment, setSelectedDepartment] =
    useState<SelectedDepartment | null>(null);
  const [selectedDescription, setSelectedDescription] =
    useState(initialDescription);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<
    string | null
  >(null);
  const [coordinates, setCoordinates] = useState({
    latitude: '',
    longitude: '',
  });
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoordinates({
            latitude: position.coords.latitude.toString(),
            longitude: position.coords.longitude.toString(),
          });
        },
        (error) => {
          console.error('Помилка отримання геолокації:', error);
        },
      );
    } else {
      console.error('Ваш браузер не підтримує геолокацію.');
    }
  }, []);

  const getQueryParams = () => {
    if (typeof window === 'undefined') return {};

    const params = new URLSearchParams(window.location.search);
    const queryParams: Record<string, string> = {};

    params.forEach((value, key) => {
      queryParams[key] = value;
    });

    return queryParams;
  };

  const openFrame = () => {
    setIsModalOpen(true);

    setTimeout(() => {
      if (iframeRef.current) {
        const queryParams = getQueryParams();
        const domain =
          typeof window !== 'undefined' ? window.location.hostname : '';

        const data = {
          placeName: 'Київ',
          latitude: coordinates.latitude,
          longitude: coordinates.longitude,
          domain: domain,
          id: selectedDepartmentId,
          ...queryParams,
        };

        const handleLoad = () => {
          if (iframeRef.current?.contentWindow) {
            iframeRef.current.contentWindow.postMessage(data, '*');
          }
        };

        iframeRef.current.addEventListener('load', handleLoad);
        iframeRef.current.src =
          'https://widget.novapost.com/division/index.html';

        return () => {
          iframeRef.current?.removeEventListener('load', handleLoad);
        };
      }
    }, 100);
  };

  const closeFrame = () => {
    setIsModalOpen(false);
    if (iframeRef.current) {
      iframeRef.current.src = '';
    }
  };

  const handleFrameMessage = useCallback(
    (event: MessageEvent) => {
      if (event.origin !== 'https://widget.novapost.com') {
        console.warn('Повідомлення з невідомого джерела:', event.origin);
        return;
      }

      if (event.data && typeof event.data === 'object') {
        const departmentData = event.data;

        const department: SelectedDepartment = {
          ...departmentData,
          coordinates:
            departmentData.latitude && departmentData.longitude
              ? {
                  latitude: parseFloat(departmentData.latitude),
                  longitude: parseFloat(departmentData.longitude),
                }
              : undefined,
        };

        const newSelectedText =
          department.shortName || 'Обрати відділення або поштомат';
        const newSelectedDescription = `${department.addressParts?.city || ''} вул. ${department.addressParts?.street || ''}, ${department.addressParts?.building || ''}`;

        setSelectedText(newSelectedText);
        setSelectedDescription(newSelectedDescription);
        setSelectedDepartmentId(department.id);
        setSelectedDepartment(department);
        if (onDepartmentSelect) {
          console.log('onDepartmentSelect-----------------', department);
          onDepartmentSelect(department);
        }

        closeFrame();
        return;
      }

      if (event.data === 'closeFrame') {
        closeFrame();
        return;
      }

      closeFrame();
    },
    [onDepartmentSelect],
  );

  useEffect(() => {
    if (isModalOpen) {
      window.addEventListener('message', handleFrameMessage);
      return () => {
        window.removeEventListener('message', handleFrameMessage);
      };
    }
  }, [
    isModalOpen,
    selectedDepartmentId,
    onDepartmentSelect,
    handleFrameMessage,
  ]);

  return (
    <>
      <div
        className={`${styles.novaPoshtaButton} ${styles.buttonHorizontal} ${styles.textRow} ${className}`}
        onClick={openFrame}
        data-selected-department-id={selectedDepartmentId}
      >
        <div className={`${styles.logo} ${styles.logoNoMargin}`}>
          <svg
            width="28"
            height="28"
            viewBox="0 0 28 28"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M11.9401 16.4237H16.0596V21.271H19.2101L15.39 25.0911C14.6227 25.8585 13.3791 25.8585 12.6118 25.0911L8.79166 21.271H11.9401V16.4237ZM21.2688 19.2102V8.78972L25.091 12.6098C25.8583 13.3772 25.8583 14.6207 25.091 15.3881L21.2688 19.2102ZM16.0596 6.73099V11.5763H11.9401V6.73099H8.78958L12.6097 2.90882C13.377 2.14148 14.6206 2.14148 15.3879 2.90882L19.2101 6.73099H16.0596ZM2.90868 12.6098L6.72877 8.78972V19.2102L2.90868 15.3901C2.14133 14.6228 2.14133 13.3772 2.90868 12.6098Z"
              fill="#DA291C"
            />
          </svg>
        </div>
        <div className={styles.angle}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M5.49399 1.44891L10.0835 5.68541L10.1057 5.70593C10.4185 5.99458 10.6869 6.24237 10.8896 6.4638C11.1026 6.69642 11.293 6.95179 11.4023 7.27063C11.5643 7.74341 11.5643 8.25668 11.4023 8.72946C11.293 9.0483 11.1026 9.30367 10.8896 9.53629C10.6869 9.75771 10.4184 10.0055 10.1057 10.2942L10.0835 10.3147L5.49398 14.5511L4.47657 13.4489L9.06607 9.21246C9.40722 8.89756 9.62836 8.69258 9.78328 8.52338C9.93272 8.36015 9.96962 8.28306 9.98329 8.24318C10.0373 8.08559 10.0373 7.9145 9.98329 7.7569C9.96963 7.71702 9.93272 7.63993 9.78328 7.4767C9.62837 7.3075 9.40722 7.10252 9.06608 6.78761L4.47656 2.55112L5.49399 1.44891Z"
              fill="#475569"
            />
          </svg>
        </div>
        <div className={styles.wrapper}>
          <span
            className={styles.text}
            style={{ marginBottom: selectedText ? '5px' : '0' }}
          >
            {selectedText}
          </span>
          <span className={styles.textDescription}>{selectedDescription}</span>
          <input
            type="hidden"
            name="department"
            value={selectedDepartment?.id}
            onChange={(e) => e.target.value}
            // defaultValue="initial value"
            // value={selectedDepartment?.id}
          />
        </div>
      </div>

      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <header className={styles.modalHeader}>
              <h2>Вибрати відділення</h2>
              <span className={styles.modalClose} onClick={closeFrame}>
                &times;
              </span>
            </header>
            <iframe
              ref={iframeRef}
              className={styles.modalIframe}
              allow="geolocation"
            />
          </div>
        </div>
      )}
    </>
  );
}
