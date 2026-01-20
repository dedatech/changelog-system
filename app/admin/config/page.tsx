'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getApiUrl } from '@/lib/config';

type Product = {
  id: string;
  name: string;
  label: string;
  enabled: boolean;
  icon: string;
  order: number;
};

type Config = {
  site: {
    title: string;
    description: string;
    domain: string;
    logo: string;
  };
  admin: {
    username: string;
    password: string;
  };
  products: Product[];
  display: {
    itemsPerPage: number;
    dateFormat: string;
  };
};

export default function ConfigPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState<Config | null>(null);

  // 加载配置
  useEffect(() => {
    loadConfig();
  }, []);

  async function loadConfig() {
    setLoading(true);
    try {
      const response = await fetch(getApiUrl('/api/config'));
      const data = await response.json();

      if (data.success) {
        setConfig(data.config);
      } else {
        alert('加载配置失败: ' + data.error);
      }
    } catch (error) {
      console.error('Error loading config:', error);
      alert('加载配置失败');
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!config) return;

    setSaving(true);
    try {
      const response = await fetch(getApiUrl('/api/config'), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });

      const data = await response.json();

      if (data.success) {
        alert('配置已保存！需要重新编译才能生效。');
      } else {
        alert('保存失败: ' + data.error);
      }
    } catch (error) {
      console.error('Error saving config:', error);
      alert('保存失败');
    } finally {
      setSaving(false);
    }
  }

  // 添加产品
  function addProduct() {
    if (!config) return;

    const newProduct: Product = {
      id: `product-${Date.now()}`,
      name: '新产品',
      label: '新产品',
      enabled: true,
      icon: '📦',
      order: config.products.length + 1,
    };

    setConfig({
      ...config,
      products: [...config.products, newProduct],
    });
  }

  // 删除产品
  function deleteProduct(productId: string) {
    if (!config) return;
    if (!confirm('确定要删除这个产品吗？')) return;

    setConfig({
      ...config,
      products: config.products.filter((p) => p.id !== productId),
    });
  }

  // 更新产品
  function updateProduct(productId: string, field: keyof Product, value: any) {
    if (!config) return;

    setConfig({
      ...config,
      products: config.products.map((p) =>
        p.id === productId ? { ...p, [field]: value } : p
      ),
    });
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
          <p className="text-gray-500 mt-4">加载中...</p>
        </div>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <span className="text-6xl">⚠️</span>
          <p className="text-gray-500 mt-4 text-lg">加载配置失败</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">系统配置</h1>
              <p className="text-sm text-gray-600 mt-1">
                管理站点信息、产品类型和显示设置
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                返回
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
              >
                {saving ? '保存中...' : '保存配置'}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* 站点信息 */}
        <section className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="text-2xl">🌐</span>
            站点信息
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                站点标题
              </label>
              <input
                type="text"
                value={config.site.title}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    site: { ...config.site, title: e.target.value },
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                站点描述（Slogan）
              </label>
              <input
                type="text"
                value={config.site.description}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    site: { ...config.site, description: e.target.value },
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                域名
              </label>
              <input
                type="text"
                value={config.site.domain}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    site: { ...config.site, domain: e.target.value },
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Logo 路径
              </label>
              <input
                type="text"
                value={config.site.logo}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    site: { ...config.site, logo: e.target.value },
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>
        </section>

        {/* 管理员账号 */}
        <section className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="text-2xl">🔐</span>
            管理员账号
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                用户名
              </label>
              <input
                type="text"
                value={config.admin.username}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    admin: { ...config.admin, username: e.target.value },
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                密码
              </label>
              <input
                type="text"
                value={config.admin.password}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    admin: { ...config.admin, password: e.target.value },
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">⚠️ 密码将以明文保存在配置文件中，请使用强密码</p>
            </div>
          </div>
        </section>

        {/* 产品类型管理 */}
        <section className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <span className="text-2xl">📦</span>
              产品类型
            </h2>
            <button
              onClick={addProduct}
              className="px-3 py-1.5 text-sm font-medium text-purple-600 hover:bg-purple-50 rounded transition-colors"
            >
              + 添加产品
            </button>
          </div>

          <div className="space-y-4">
            {config.products.map((product) => (
              <div
                key={product.id}
                className="border border-gray-200 rounded-lg p-4 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={product.icon}
                      onChange={(e) =>
                        updateProduct(product.id, 'icon', e.target.value)
                      }
                      className="w-12 text-center px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    <span className="text-gray-500">图标</span>
                  </div>
                  <button
                    onClick={() => deleteProduct(product.id)}
                    className="text-red-600 hover:text-red-700 text-sm"
                  >
                    删除
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      ID（唯一标识）
                    </label>
                    <input
                      type="text"
                      value={product.id}
                      onChange={(e) =>
                        updateProduct(product.id, 'id', e.target.value)
                      }
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      名称（显示标签）
                    </label>
                    <input
                      type="text"
                      value={product.name}
                      onChange={(e) =>
                        updateProduct(product.id, 'name', e.target.value)
                      }
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Label
                    </label>
                    <input
                      type="text"
                      value={product.label}
                      onChange={(e) =>
                        updateProduct(product.id, 'label', e.target.value)
                      }
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      排序
                    </label>
                    <input
                      type="number"
                      value={product.order}
                      onChange={(e) =>
                        updateProduct(product.id, 'order', parseInt(e.target.value))
                      }
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={`enabled-${product.id}`}
                    checked={product.enabled}
                    onChange={(e) =>
                      updateProduct(product.id, 'enabled', e.target.checked)
                    }
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <label htmlFor={`enabled-${product.id}`} className="text-sm text-gray-700">
                    启用
                  </label>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 显示设置 */}
        <section className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="text-2xl">⚙️</span>
            显示设置
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                每页显示版本数
              </label>
              <input
                type="number"
                value={config.display.itemsPerPage}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    display: {
                      ...config.display,
                      itemsPerPage: parseInt(e.target.value),
                    },
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                日期格式
              </label>
              <select
                value={config.display.dateFormat}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    display: {
                      ...config.display,
                      dateFormat: e.target.value,
                    },
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="YYYY-MM-DD">YYYY-MM-DD (2026-01-19)</option>
                <option value="YYYY年MM月DD日">YYYY年MM月DD日 (2026年01月19日)</option>
              </select>
            </div>
          </div>
        </section>

        {/* 说明 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">💡 提示</h3>
          <ul className="text-xs text-blue-800 space-y-1">
            <li>• 保存配置后需要重新编译前端才能生效（运行 npm run build）</li>
            <li>• 产品 ID 必须唯一，用于内部标识</li>
            <li>• 排序数字越小越靠前</li>
            <li>• Logo 默认放在 public 目录下</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
