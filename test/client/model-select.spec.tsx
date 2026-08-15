// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import type { SessionModels } from '@deepseek-ai/dsh-api-remotes/client'
import type { ModelDirectory } from '@deepseek-ai/dsh-client-ui-model-selection/client'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { SideChatModelSelect } from '../../src/client/panel/SideChatModelSelect.js'

const catalog: SessionModels = {
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
}

function modelDirectory(): ModelDirectory {
  const state = {
    status: 'ready' as const,
    ...catalog,
    error: null,
  }
  return {
    store: {
      getSnapshot: () => state,
      subscribe: () => () => {},
    },
    load: vi.fn(async () => catalog),
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
      })
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
