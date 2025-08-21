<template>
	<VueUeditorWrap
		v-model="model"
		:config="mergedConfig"
		:editor-dependencies="editorDependencies"
		:style="editorStyle"
	/>
</template>
  
<script setup>
import { computed } from 'vue'
import { VueUeditorWrap } from 'vue-ueditor-wrap'

const props = defineProps({
  modelValue: String,
  localConfig: Object,
  editorStyle: {  // 接收完整样式对象
    type: Object,
    default: () => ({ height: '545px', width: '630px' })
  }
});

const emit = defineEmits(['update:modelValue'])

// v-model 透传
const model = computed({
	get: () => props.modelValue,
	set: (value) => emit('update:modelValue', value)
})

// 合并全局配置和局部配置
const mergedConfig = computed(() => {
	const token = localStorage.getItem('token')
	// ChatAnywhere（OpenAI 兼容）配置，使用 Vite 环境变量
	// 通过后端代理隐藏密钥
	const CHATANYWHERE_URL = '/api/ai/chat'
	const CHATANYWHERE_MODEL = import.meta.env.VITE_CHATANYWHERE_MODEL || 'gpt-3.5-turbo'
	return {
		UEDITOR_HOME_URL: '/static/UEditorPlus/',
		UEDITOR_CORS_URL: '/static/UEditorPlus/',
		// 同时通过 URL 传 token，兼容表单提交场景（无法自定义 Header）
		serverUrl: token ? `/api/upload?token=${encodeURIComponent(token)}` : '/api/upload',
		// 不从服务端拉取配置，避免 /api/upload?action=config 404
		loadConfigFromServer: false,
		// 强制中文语言并指定语言路径，避免语言文件未加载报错
		lang: 'zh-cn',
		langPath: '/static/UEditorPlus/lang/',
		// 固定编辑区高度并在内部滚动
		autoHeightEnabled: false,
		// 明确图片上传参数，避免取默认值导致不一致
		imageActionName: 'uploadimage',
		imageFieldName: 'upfile',
		imageMaxSize: 2 * 1024 * 1024,
		imageAllowFiles: ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp'],
		imageUrlPrefix: '',
		// 提升层级，避免被页面其它组件遮挡
		zIndex: 4000,
		debug: true,
		// 确保本地上传未禁用
		imageConfig: {
			disableUpload: false,
			disableOnline: false
		},

		// 通过请求头传递鉴权信息，避免URL缺少token
		serverHeaders: token ? { Authorization: `Bearer ${token}` } : {},
		// AI 工具栏：对接 ChatAnywhere OpenAI 兼容接口
		ai: {
			driver: 'OpenAi',
			driverConfig: {
				url: CHATANYWHERE_URL,
				key: '',
				model: CHATANYWHERE_MODEL
			}
		},
		...props.localConfig
	}
})

// 指定实际存在的静态资源并补充必要样式，确保对话框正常显示
const editorDependencies = computed(() => [
	// core js
	'ueditor.config.js',
	'ueditor.all.js',
	// core css
	'themes/default/css/ueditor.css',
	'themes/default/dialog.css',
	'themes/default/dialogbase.css',
	'themes/iframe.css',
	// plugin css (simpleupload/webuploader)
	'third-party/webuploader/webuploader.css'
])
</script>

<style scoped>
</style>