'use client';

import React, { useState, useEffect } from 'react';
import { getApiUrl } from '@/lib/config';

type ImageFile = {
  filename: string;
  url: string;
  timestamp: number;
};

type ImagePickerProps = {
  onSelect: (imageUrl: string, altText: string) => void;
  onClose: () => void;
};

export function ImagePicker({ onSelect, onClose }: ImagePickerProps) {
  const [loading, setLoading] = useState(true);
  const [images, setImages] = useState<ImageFile[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [altText, setAltText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // 加载图片列表
  useEffect(() => {
    loadImages();
  }, []);

  async function loadImages() {
    setLoading(true);
    try {
      const response = await fetch(getApiUrl('/api/uploads'));
      const data = await response.json();

      if (data.success) {
        setImages(data.files);
      }
    } catch (error) {
      console.error('Error loading images:', error);
      alert('加载图片列表失败');
    } finally {
      setLoading(false);
    }
  }

  // 过滤图片
  const filteredImages = images.filter((img) =>
    img.filename.toLowerCase().includes(searchQuery.toLowerCase())
  );

  function handleSelect() {
    if (selectedImage) {
      onSelect(selectedImage, altText || selectedImage);
      onClose();
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* 标题栏 */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-purple-50 to-blue-50">
          <div>
            <h2 className="text-xl font-bold text-gray-900">图片库</h2>
            <p className="text-sm text-gray-500 mt-1">选择已上传的图片插入到编辑器</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-3xl font-light leading-none transition-colors"
            aria-label="关闭"
          >
            ×
          </button>
        </div>

        {/* 搜索栏 */}
        <div className="px-6 py-3 border-b border-gray-200 bg-white">
          <input
            type="text"
            placeholder="搜索图片..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        {/* 图片网格 */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
                <p className="text-gray-500 mt-4">加载中...</p>
              </div>
            </div>
          ) : filteredImages.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <span className="text-6xl">📭</span>
                <p className="text-gray-500 mt-4 text-lg">
                  {searchQuery ? '没有找到匹配的图片' : '暂无已上传的图片'}
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {filteredImages.map((image) => (
                <div
                  key={image.filename}
                  onClick={() => setSelectedImage(image.url)}
                  className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer border-2 transition-all hover:shadow-lg ${
                    selectedImage === image.url
                      ? 'border-purple-600 ring-2 ring-purple-300'
                      : 'border-gray-200 hover:border-purple-400'
                  }`}
                >
                  <img
                    src={image.url}
                    alt={image.filename}
                    className="w-full h-full object-cover"
                  />
                  {selectedImage === image.url && (
                    <div className="absolute top-2 right-2 bg-purple-600 text-white rounded-full p-1">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-2 truncate">
                    {image.filename}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Alt 文本输入 */}
        {selectedImage && (
          <div className="px-6 py-4 border-t border-gray-200 bg-white">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              图片说明（Alt 文本）
            </label>
            <input
              type="text"
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              placeholder="例如：功能截图"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        )}

        {/* 底部按钮 */}
        <div className="px-6 py-4 border-t border-gray-200 bg-white flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-medium"
          >
            取消
          </button>
          <button
            onClick={handleSelect}
            disabled={!selectedImage}
            className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium shadow-md"
          >
            插入图片
          </button>
        </div>
      </div>
    </div>
  );
}
