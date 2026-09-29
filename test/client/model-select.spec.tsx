// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import type {
  ModelDirectory,
  ModelDirectoryState,
} from '@deepseek-ai/dsh-client-ui-model-selection/client'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { SideChatModelSelect } from '../../src/client/panel/SideChatModelSelect.js'

const catalog = {
  current: { provider: 'openai', model: 'o3', reasoningEffort: 'medium' },
  routable: true,
  groups: [{
    id: 'openai',
    name: 'OpenAI',
    models: [{
      id: 'o3',
      name: 'o3',
      description: 'Reasoning model',
      reasoning: {
        defaultEffort: 'medium',
        efforts: [
          { id: 'low', name: 'Low', description: 'Faster' },
          { id: 'medium', name: 'Medium', description: 'Balanced' },
          { id: 'high', name: 'High', description: 'Deeper' },
        ],
      },
    }, {
      id: 'flash',
      name: 'Flash',
      description: 'Fast model',
    }],
  }],
  failures: [],
  pending: null,
} satisfies Omit<ModelDirectoryState, 'error' | 'status'>

function modelDirectory(overrides: Partial<ModelDirectoryState> = {}): ModelDirectory {
  const state: ModelDirectoryState = {
    status: 'ready',
    ...catalog,
    error: null,
    ...overrides,
  }
  return {
    store: {
      getSnapshot: () => state,
      subscribe: () => () => {},
    },
    load: vi.fn(async () => state),
  } as unknown as ModelDirectory
}

afterEach(cleanup)

describe('SideChatModelSelect', () => {
  it('initializes from DSH and exposes its native two-level menu', async () => {
    const onInitialize = vi.fn()
    const onSelect = vi.fn(async (selection) => ({ ok: true as const, value: selection }))
    render(
      <SideChatModelSelect
        directory={modelDirectory()}
        locked={false}
        onInitialize={onInitialize}
        onSelect={onSelect}
      />,
    )

    await waitFor(() => {
      expect(onInitialize).toHaveBeenCalledWith({
        provider: 'openai',
        model: 'o3',
        reasoningEffort: 'medium',
      }, { remember: false })
    })
    const trigger = screen.getByRole('button', {
      name: 'Select model, current o3, reasoning effort Medium',
    })
    expect(trigger).toHaveTextContent('o3')
    expect(trigger).toHaveTextContent('Medium')

    fireEvent.click(trigger)
    expect(screen.getByRole('menuitem', { name: /Model/ })).toHaveTextContent('o3')
    fireEvent.click(screen.getByRole('menuitem', { name: /Effort/ }))
    expect(screen.getAllByRole('menuitemradio')).toHaveLength(3)
    fireEvent.click(screen.getByRole('menuitemradio', { name: /Low/ }))

    await waitFor(() => {
      expect(onSelect).toHaveBeenCalledWith({
        provider: 'openai',
        model: 'o3',
        reasoningEffort: 'low',
      })
    })
  })

  it('keeps the effort menu usable during generation and explains next-reply behavior', async () => {
    const onSelect = vi.fn(async selection => ({ ok: true as const, value: selection }))
    render(<SideChatModelSelect directory={modelDirectory()} locked={false} running
      onInitialize={vi.fn()} onSelect={onSelect} />)
    const trigger = screen.getByRole('button', { name: /Select model/ })
    expect(trigger).not.toBeDisabled()
    fireEvent.click(trigger)
    expect(screen.getByText('Changes apply to the next reply and future Side Chats.')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('menuitem', { name: /Effort/ }))
    fireEvent.click(screen.getByRole('menuitemradio', { name: /High/ }))
    await waitFor(() => expect(onSelect).toHaveBeenCalledWith({
      provider: 'openai', model: 'o3', reasoningEffort: 'high',
    }))
  })

  it('saves an explicit choice even when it matches the displayed default effort', async () => {
    const onSelect = vi.fn(async selection => ({ ok: true as const, value: selection }))
    render(<SideChatModelSelect directory={modelDirectory()} locked={false}
      onInitialize={vi.fn()} onSelect={onSelect} />)
    fireEvent.click(screen.getByRole('button', { name: /Select model/ }))
    fireEvent.click(screen.getByRole('menuitem', { name: /Effort/ }))
    fireEvent.click(screen.getByRole('menuitemradio', { name: /Medium/ }))
    await waitFor(() => expect(onSelect).toHaveBeenCalledWith({
      provider: 'openai', model: 'o3', reasoningEffort: 'medium',
    }))
  })

  it.each([
    {
      name: 'missing model',
      selection: { provider: 'missing', model: 'retired' },
      expected: { provider: 'openai', model: 'o3', reasoningEffort: 'medium' },
    },
    {
      name: 'retired effort',
      selection: { provider: 'openai', model: 'o3', reasoningEffort: 'ultra' },
      expected: { provider: 'openai', model: 'o3', reasoningEffort: 'medium' },
    },
  ])('repairs a remembered $name from the current directory', async ({ selection, expected }) => {
    const onInitialize = vi.fn()
    render(
      <SideChatModelSelect
        directory={modelDirectory()}
        selection={selection}
        locked={false}
        onInitialize={onInitialize}
        onSelect={vi.fn()}
      />,
    )

    await waitFor(() => {
      expect(onInitialize).toHaveBeenCalledWith(expected, { remember: true })
    })
  })

  it('does not overwrite a remembered model after a partial catalog failure', () => {
    const directory = modelDirectory({
      failures: [{ id: 'offline', name: 'Offline', message: 'Unavailable' }],
    })
    const onInitialize = vi.fn()
    render(<SideChatModelSelect
      directory={directory}
      selection={{ provider: 'offline', model: 'saved-model' }} locked={false}
      onInitialize={onInitialize} onSelect={vi.fn()}
    />)
    expect(onInitialize).not.toHaveBeenCalled()
    expect(screen.getByRole('button', { name: 'Select model, current saved-model' })).toBeInTheDocument()
  })

  it('unlocks model controls after a rejected selection promise', async () => {
    const onSelect = vi.fn().mockRejectedValue(new Error('Provider unavailable'))
    render(<SideChatModelSelect directory={modelDirectory()} locked={false}
      onInitialize={vi.fn()} onSelect={onSelect} />)
    fireEvent.click(screen.getByRole('button', { name: /Select model/ }))
    fireEvent.click(screen.getByRole('menuitem', { name: /Model/ }))
    fireEvent.click(screen.getByRole('menuitemradio', { name: /Flash/ }))
    await waitFor(() => {
      expect(screen.getByRole('menuitemradio', { name: /Flash/ })).not.toBeDisabled()
      expect(onSelect).toHaveBeenCalledOnce()
    })
    expect(await screen.findByText('Model operation failed: Provider unavailable')).toBeInTheDocument()
  })

  it('switches provider models without carrying another model effort', async () => {
    const onSelect = vi.fn(async (selection) => ({ ok: true as const, value: selection }))
    render(
      <SideChatModelSelect
        directory={modelDirectory()}
        selection={{ provider: 'openai', model: 'o3', reasoningEffort: 'high' }}
        locked={false}
        onInitialize={vi.fn()}
        onSelect={onSelect}
      />,
    )

    fireEvent.click(screen.getByRole('button', {
      name: 'Select model, current o3, reasoning effort High',
    }))
    fireEvent.click(screen.getByRole('menuitem', { name: /Model/ }))
    expect(screen.getByText('OpenAI')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('menuitemradio', { name: /Flash/ }))

    await waitFor(() => {
      expect(onSelect).toHaveBeenCalledWith({ provider: 'openai', model: 'flash' })
    })
  })
})
